# StudyFlow AI

Turn a topic or a page of notes into something you actually study with —
flip-through flashcards and a scored quiz that retests what you got wrong,
generated on the fly by an LLM and rendered as real interactive UI.

**This is not a chatbot.** The model is constrained to return a strict JSON
shape. The backend validates that shape before the frontend ever sees it,
and the frontend defensively re-checks it again before rendering. The
result is structured data driving stateful components — never raw model
text dropped into a chat bubble.

## Live demo

`[add your deployed URL here if you deploy it]`

## What it does

1. Enter a topic ("the French Revolution") or paste raw notes.
2. StudyFlow AI generates 5–10 flashcards and 5–8 quiz questions from that
   input.
3. Flip through the flashcards (tap, click, or `Space`/`Enter`; `←`/`→` to
   navigate).
4. Take the quiz. Wrong answers are tracked automatically.
5. Hit **Retest Wrong Answers** to loop back through only what you missed,
   as many rounds as it takes to clear them all.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite), hand-written CSS | No UI framework — full control over the 3D flip card and glass surfaces |
| Backend | Node + Express | Thin proxy so the API key never reaches the browser |
| Model | Groq `openai/gpt-oss-20b` | Fast inference, generous free tier, strong at constrained JSON output |

> Groq deprecates and renames models periodically. If you hit a
> `model_not_found` error, your `GROQ_MODEL` in `.env` is pointing at a
> retired model — check `console.groq.com/docs/models` for the current
> lineup and update accordingly.

## Setup

### 1. Clone

```bash
git clone https://github.com/221fa04470/studyflow-ai.git
cd studyflow-ai
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# add your Groq API key to .env — free tier: https://console.groq.com
npm start
```

Runs at `http://localhost:8787`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` and proxies `/api/*` to the backend (see
`vite.config.js`). Open it, enter a topic, generate.

## Architecture

```
App                          — owns request lifecycle: idle / loading / error / ready
├── BackgroundDecor          — decorative floating 3D shapes (aria-hidden)
├── StudyInput                — hero + glass textarea + generate button
│   └── ExamplePrompts
├── EmptyState / LoadingState / ErrorState
└── StudyDashboard
    ├── FlashcardDeck         — owns current card index
    │   └── Flashcard         — 3D perspective flip: front/back faces
    └── Quiz                  — owns round, score, wrong-answer pool
        ├── QuizProgress
        ├── QuizQuestion
        └── QuizResult
            └── RetestWrongAnswers
```

State stays local to the component that owns it — no external state
library. `App` never passes generation state deeper than `StudyDashboard`;
`FlashcardDeck` and `Quiz` each manage their own interaction state
independently.

## Handling an unreliable model

This is where most of the engineering effort went, deliberately:

- **Malformed / non-JSON output** — the backend attempts a direct
  `JSON.parse`, then falls back to extracting the outermost `{...}` block
  (models frequently wrap JSON in markdown fences or add stray commentary).
- **Wrong shape** — a `validateShape()` check confirms every required field
  is present and correctly typed: non-empty `flashcards`/`quiz` arrays,
  exactly 4 options per quiz question, a `correctIndex` in range, etc.
  Anything that doesn't match is rejected before it reaches the client.
- **One automatic repair pass** — a first validation failure triggers a
  single follow-up request asking the model to correct its own output,
  before giving up and surfacing an error.
- **Graceful failure, not a crash** — a `502`/`504` from the backend maps
  to a designed error state in the UI ("Something went wrong — we couldn't
  generate your study material. Please try again.") with a retry action.
  Raw error text is never shown by default; it sits behind a collapsed
  "Technical details" toggle for debugging.
- **Defense in depth on the frontend** — `StudyDashboard` normalizes and
  filters the payload again before rendering, so even a gap between what
  the backend validated and what the frontend expects can't crash the
  component tree.
- **Timeouts** — the Groq call is aborted after 20s server-side, surfaced
  as the same error state rather than a hang.
- **Stale-response protection** — firing a new generation request aborts
  any request still in flight and tags each request with an incrementing
  ID, so a slow, outdated response can never overwrite a newer one already
  on screen.
- **Empty input** — blocked client-side (disabled button) and server-side
  (`400` response) as two independent checks.

## Design

A dark, layered AI-product aesthetic rather than a flat education
dashboard: deep indigo background, glass surfaces (`backdrop-filter:
blur`), a violet→cyan gradient as the primary accent, and coral reserved
specifically for the wrong-answer/retest state so it carries meaning
rather than decoration.

Type: Space Grotesk for headings and card content, Inter for body text,
IBM Plex Mono only for small counters and eyebrow labels ("Card 1 / 8") —
a deliberate nod to data-dense SaaS tooling.

The flashcard is the centerpiece: genuine CSS 3D (`perspective`,
`transform-style: preserve-3d`, `rotateY`, `backface-visibility: hidden`),
not a faked cross-fade. It flips on tap, click, or keyboard, and the deck
supports arrow-key navigation between cards.

Fully responsive from 320px up — tabs, controls, and decorative elements
adapt at each breakpoint — and every animation respects
`prefers-reduced-motion`.

## Known limitations

- No streaming — the full result renders only once generation completes.
- No session persistence — a page refresh clears the current study set.
- The repair pass fires once; two consecutive malformed responses require
  a manual retry.
- Dark theme only, by design.

## What I'd build next

- Stream the response as it generates rather than waiting for the full
  payload.
- Persist sessions to `localStorage` so a refresh doesn't lose progress.
- Support mixed block types from the model (e.g. a summary card alongside
  flashcards/quiz), each rendered with its own component.
- A refinement loop — "make this harder," "add five more cards" — that
  edits the existing result instead of regenerating from scratch.

## AI-usage note

I used Claude during development to help scaffold the project structure,
draft the JSON validation logic, and build out the component and styling
work. All code was reviewed, tested, and understood before being committed.

## Time spent

**~8 hours**, roughly:

- 1.5h — backend: Express proxy, prompt design, JSON extraction/validation,
  repair-retry logic, timeout handling
- 4h — frontend: component architecture, state management (request
  lifecycle, flashcard deck, quiz rounds), 3D flip-card and visual design
- 1h — responsive pass, keyboard navigation, reduced-motion support,
  accessibility (focus states, aria labels)
- 1h — debugging a deprecated model reference after Groq retired it, plus
  testing failure paths (malformed JSON, empty input, aborted requests)
- 0.5h — README and final verification
