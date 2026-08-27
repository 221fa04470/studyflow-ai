export default function RetestWrongAnswers({ count, onRetest }) {
  if (count <= 0) return null;
  return (
    <div className="sf-retest-panel">
      <p>{count} question{count === 1 ? "" : "s"} to review.</p>
      <button className="sf-retest-btn" onClick={onRetest}>
        Retest Wrong Answers
      </button>
    </div>
  );
}
