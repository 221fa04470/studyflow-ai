import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;
// llama-3.1-8b-instant was deprecated by Groq; openai/gpt-oss-20b is the
// recommended replacement. Override via GROQ_MODEL in .env if needed.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 20000;

// ---------- Prompt ----------

const SYSTEM_PROMPT = `You are a study-material generator. Given a topic or a block of notes, produce study material as JSON only.

Return ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:

{
  "topic": string,                     // short title for the material
  "flashcards": [
    { "question": string, "answer": string }
  ],
  "quiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number,          // 0-based index into options
      "explanation": string
    }
  ]
}

Rules:
- Produce between 5 and 10 flashcards and between 5 and 8 quiz questions.
- Each quiz question must have exactly 4 options and correctIndex must be a valid index (0-3).
- Base everything strictly on the user's input. If the input is too vague or empty to build real study material from, still return valid JSON with your best reasonable interpretation of a study topic.
- Output must be valid, parseable JSON and nothing else.`;

function buildUserPrompt(input) {
  return `Generate study flashcards and a quiz from the following notes/topic:\n\n"""\n${input}\n"""`;
}

const REPAIR_SUFFIX = `\n\nYour previous response could not be parsed as valid JSON matching the required shape. Return ONLY the corrected JSON object now, with no markdown fences and no extra text.`;

// ---------- Validation ----------

function validateShape(data) {
  if (!data || typeof data !== "object") return "Response is not an object";
  if (typeof data.topic !== "string" || !data.topic.trim()) return "Missing topic";

  if (!Array.isArray(data.flashcards) || data.flashcards.length < 1) {
    return "Missing or empty flashcards array";
  }
  for (const [i, card] of data.flashcards.entries()) {
    if (!card || typeof card.question !== "string" || typeof card.answer !== "string") {
      return `Flashcard at index ${i} is malformed`;
    }
  }

  if (!Array.isArray(data.quiz) || data.quiz.length < 1) {
    return "Missing or empty quiz array";
  }
  for (const [i, q] of data.quiz.entries()) {
    if (
      !q ||
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((o) => typeof o !== "string") ||
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3 ||
      typeof q.explanation !== "string"
    ) {
      return `Quiz question at index ${i} is malformed`;
    }
  }

  return null; // valid
}

// Model output sometimes wraps JSON in ```json fences or adds stray text.
// Try a direct parse first, then fall back to extracting the outermost {...}.
function extractJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = trimmed.slice(start, end + 1);
    return JSON.parse(candidate); // may throw; caller catches
  }
  throw new Error("No JSON object found in model output");
}

// ---------- Groq call with timeout ----------

async function callGroq(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Groq API error ${res.status}: ${body.slice(0, 300)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq response had no content");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- Route ----------

app.post("/api/generate", async (req, res) => {
  const { input } = req.body || {};

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Field 'input' is required and must be non-empty text." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Add it to backend/.env." });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];

  try {
    let raw = await callGroq(messages);
    let parsed, err;

    try {
      parsed = extractJson(raw);
      err = validateShape(parsed);
    } catch (e) {
      err = e.message;
    }

    // One repair attempt if the first response was malformed
    if (err) {
      const repairMessages = [
        ...messages,
        { role: "assistant", content: raw },
        { role: "user", content: REPAIR_SUFFIX },
      ];
      raw = await callGroq(repairMessages);
      try {
        parsed = extractJson(raw);
        err = validateShape(parsed);
      } catch (e) {
        err = e.message;
      }
    }

    if (err) {
      return res.status(502).json({ error: `Model returned unusable output after retry: ${err}` });
    }

    return res.json(parsed);
  } catch (e) {
    if (e.name === "AbortError") {
      return res.status(504).json({ error: "The model took too long to respond. Please try again." });
    }
    console.error(e);
    return res.status(502).json({ error: e.message || "Failed to generate study material." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Study Assistant backend running on http://localhost:${PORT}`);
});
