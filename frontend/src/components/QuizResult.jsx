import RetestWrongAnswers from "./RetestWrongAnswers.jsx";

export default function QuizResult({ correctCount, total, wrongCount, onRetest, onRestart }) {
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="sf-quiz-result">
      <div className="sf-score-ring" style={{ "--pct": pct }}>
        <div className="fill" aria-hidden="true" />
        <div>
          <div className="num">{pct}%</div>
        </div>
      </div>

      <div className="sf-score-breakdown">
        <span className="item">
          <span className="swatch good" /> {correctCount} correct
        </span>
        <span className="item">
          <span className="swatch bad" /> {wrongCount} incorrect
        </span>
      </div>

      {wrongCount > 0 ? (
        <RetestWrongAnswers count={wrongCount} onRetest={onRetest} />
      ) : (
        <p className="sf-perfect-tag">All correct — nice work!</p>
      )}

      <div style={{ marginTop: 18 }}>
        <button className="sf-ctrl-btn" onClick={onRestart}>
          Restart full quiz
        </button>
      </div>
    </div>
  );
}
