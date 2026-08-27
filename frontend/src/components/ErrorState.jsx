export default function ErrorState({ message, onRetry }) {
  return (
    <div className="sf-state-card sf-glass is-error" role="alert">
      <div className="sf-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M12 8v5M12 16.5h.01M10.3 3.9 2.7 17.1a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z"
            stroke="var(--danger)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3>Something went wrong</h3>
      <p>We couldn't generate your study material. Please try again.</p>
      <button className="sf-retry-btn" onClick={onRetry}>
        Try again
      </button>
      {message && (
        <details className="sf-error-details">
          <summary>Technical details</summary>
          <pre>{message}</pre>
        </details>
      )}
    </div>
  );
}
