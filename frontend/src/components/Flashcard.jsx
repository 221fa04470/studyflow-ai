// Pure presentational flip card: perspective + rotateY + backface-visibility.
// `flipped` and `onFlip` are controlled by the parent (FlashcardDeck) so the
// deck can reset the flip state whenever the active card changes.
export default function Flashcard({ question, answer, flipped, onFlip }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
    }
  }

  return (
    <div className="sf-flip-stage">
      <div
        className={`sf-flip-card ${flipped ? "flipped" : ""}`}
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Showing answer. Press to show question." : "Showing question. Press to show answer."}
      >
        <div className="sf-flip-face front">
          <span className="sf-eyebrow">Question</span>
          <p className="sf-flip-text">{question}</p>
          <span className="sf-flip-hint">Tap to flip</span>
        </div>
        <div className="sf-flip-face back">
          <span className="sf-eyebrow">Answer</span>
          <p className="sf-flip-text">{answer}</p>
          <span className="sf-flip-hint">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
}
