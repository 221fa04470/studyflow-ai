import { useState } from "react";
import ExamplePrompts from "./ExamplePrompts.jsx";

export default function StudyInput({ onSubmit, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  function handlePick(example) {
    setText(example);
  }

  return (
    <>
      <div className="sf-hero">
        <span className="sf-hero-badge sf-glass">
          <span className="dot" aria-hidden="true" />
          AI-generated, structured, interactive
        </span>
        <h1>Turn your notes into something you actually remember.</h1>
        <p>
          Paste a topic or your raw notes. StudyFlow AI turns them into flashcards and a quiz
          you can work through, not another wall of text.
        </p>
      </div>

      <form className="sf-input-card sf-glass" onSubmit={handleSubmit}>
        <textarea
          className="sf-textarea"
          placeholder="Paste your notes or enter a topic..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={disabled}
          aria-label="Notes or topic to study"
        />
        <div className="sf-input-footer">
          <button type="submit" className="sf-generate-btn" disabled={disabled || !text.trim()}>
            {disabled ? "Generating..." : "Generate Study Material"}
            {!disabled && (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      <ExamplePrompts onPick={handlePick} disabled={disabled} />
    </>
  );
}
