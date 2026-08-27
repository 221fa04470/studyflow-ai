const LETTERS = ["A", "B", "C", "D"];

export default function QuizQuestion({ question, selected, answered, onSelect, onNext, isLast }) {
  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <div>
      <p className="sf-quiz-question">{question.question}</p>

      <div className="sf-quiz-options">
        {options.map((opt, i) => {
          let cls = "sf-quiz-option";
          if (answered) {
            if (i === question.correctIndex) cls += " correct";
            else if (i === selected) cls += " incorrect";
          } else if (i === selected) {
            cls += " selected";
          }
          return (
            <button key={i} className={cls} onClick={() => onSelect(i)} disabled={answered}>
              <span className="letter">{LETTERS[i] || i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="sf-quiz-feedback">
          <p className={`sf-feedback-tag ${selected === question.correctIndex ? "good" : "bad"}`}>
            {selected === question.correctIndex ? "Correct" : "Not quite"}
          </p>
          {question.explanation && <p className="sf-quiz-explanation">{question.explanation}</p>}
          <button className="sf-ctrl-btn primary" onClick={onNext}>
            {isLast ? "See results" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
