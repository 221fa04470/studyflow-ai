import { useState } from "react";
import FlashcardDeck from "./FlashcardDeck.jsx";
import Quiz from "./Quiz.jsx";

// Belt-and-suspenders: the backend already validates the AI's JSON shape,
// but the frontend never trusts that blindly either — this normalizes
// whatever comes through so a malformed field can't crash the render tree.
function normalize(data) {
  const topic = typeof data?.topic === "string" && data.topic.trim() ? data.topic : "Your study set";
  const flashcards = Array.isArray(data?.flashcards)
    ? data.flashcards.filter((c) => c && typeof c.question === "string" && typeof c.answer === "string")
    : [];
  const quiz = Array.isArray(data?.quiz)
    ? data.quiz.filter(
        (q) =>
          q &&
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctIndex === "number"
      )
    : [];
  return { topic, flashcards, quiz };
}

export default function StudyDashboard({ data }) {
  const [tab, setTab] = useState("flashcards");
  const { topic, flashcards, quiz } = normalize(data);

  return (
    <div>
      <div className="sf-dash-header">
        <h2 className="sf-dash-topic">{topic}</h2>
      </div>

      <div className="sf-tabs" role="tablist" aria-label="Study material view">
        <button
          role="tab"
          aria-selected={tab === "flashcards"}
          className={`sf-tab ${tab === "flashcards" ? "active" : ""}`}
          onClick={() => setTab("flashcards")}
        >
          Flashcards ({flashcards.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "quiz"}
          className={`sf-tab ${tab === "quiz" ? "active" : ""}`}
          onClick={() => setTab("quiz")}
        >
          Quiz ({quiz.length})
        </button>
      </div>

      {tab === "flashcards" ? <FlashcardDeck cards={flashcards} /> : <Quiz questions={quiz} />}
    </div>
  );
}
