import { useEffect, useState } from "react";
import Flashcard from "./Flashcard.jsx";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const safeCards = Array.isArray(cards) ? cards : [];
  const hasCards = safeCards.length > 0;
  const card = hasCards ? safeCards[index] : null;
  const progressPct = hasCards ? ((index + 1) / safeCards.length) * 100 : 0;

  function goNext() {
    if (!hasCards) return;
    setFlipped(false);
    setIndex((i) => (i + 1) % safeCards.length);
  }

  function goPrev() {
    if (!hasCards) return;
    setFlipped(false);
    setIndex((i) => (i - 1 + safeCards.length) % safeCards.length);
  }

  // Keyboard support: left/right to navigate, space/enter handled by Flashcard itself for flipping.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [safeCards.length]);

  if (!hasCards) {
    return (
      <div className="sf-deck sf-glass">
        <p>No flashcards were generated for this topic.</p>
      </div>
    );
  }

  return (
    <div className="sf-deck sf-glass">
      <div className="sf-deck-meta">
        <span className="sf-eyebrow">
          Card {index + 1} / {safeCards.length}
        </span>
        <div className="sf-progress-track" aria-hidden="true">
          <div className="sf-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <Flashcard
        question={card.question}
        answer={card.answer}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      <div className="sf-deck-controls">
        <button className="sf-ctrl-btn" onClick={goPrev} aria-label="Previous card">
          ← Prev
        </button>
        <button className="sf-ctrl-btn primary" onClick={() => setFlipped((f) => !f)}>
          {flipped ? "Show question" : "Show answer"}
        </button>
        <button className="sf-ctrl-btn" onClick={goNext} aria-label="Next card">
          Next →
        </button>
      </div>

      <p className="sf-keyboard-hint">
        Use <kbd>←</kbd> <kbd>→</kbd> to navigate, <kbd>Space</kbd> to flip
      </p>
    </div>
  );
}
