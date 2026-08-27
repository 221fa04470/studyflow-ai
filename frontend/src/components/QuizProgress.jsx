export default function QuizProgress({ current, total, round }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="sf-deck-meta">
      <span className="sf-eyebrow">
        {round > 1 ? `Round ${round} — ` : ""}Question {current} / {total}
      </span>
      <div className="sf-progress-track" aria-hidden="true">
        <div className="sf-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
