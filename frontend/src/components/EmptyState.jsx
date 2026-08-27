export default function EmptyState() {
  return (
    <div className="sf-state-card sf-glass">
      <div className="sf-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
            stroke="var(--cyan)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3>Ready when you are.</h3>
      <p>Enter a topic or paste in your notes above, and I'll turn them into flashcards and a quiz.</p>
    </div>
  );
}
