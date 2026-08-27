import { useMemo, useState } from "react";
import QuizProgress from "./QuizProgress.jsx";
import QuizQuestion from "./QuizQuestion.jsx";
import QuizResult from "./QuizResult.jsx";

export default function Quiz({ questions }) {
  const allQuestions = Array.isArray(questions) ? questions : [];

  const [pool, setPool] = useState(allQuestions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [wrongOnes, setWrongOnes] = useState([]);
  const [phase, setPhase] = useState("active"); // "active" | "summary"
  const [round, setRound] = useState(1);

  const correctCount = useMemo(() => pool.length - wrongOnes.length, [pool, wrongOnes]);

  if (!allQuestions.length) {
    return (
      <div className="sf-quiz sf-glass">
        <p>No quiz questions were generated for this topic.</p>
      </div>
    );
  }

  const q = pool[current];

  function handleSelect(optIndex) {
    if (answered) return;
    setSelected(optIndex);
    setAnswered(true);
    if (optIndex !== q.correctIndex) {
      setWrongOnes((w) => [...w, q]);
    }
  }

  function handleNext() {
    if (current + 1 < pool.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase("summary");
    }
  }

  function handleRetest() {
    setPool(wrongOnes);
    setWrongOnes([]);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setPhase("active");
    setRound((r) => r + 1);
  }

  function handleRestart() {
    setPool(allQuestions);
    setWrongOnes([]);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setPhase("active");
    setRound(1);
  }

  return (
    <div className="sf-quiz sf-glass">
      {phase === "active" ? (
        <>
          <QuizProgress current={current + 1} total={pool.length} round={round} />
          <QuizQuestion
            question={q}
            selected={selected}
            answered={answered}
            onSelect={handleSelect}
            onNext={handleNext}
            isLast={current + 1 >= pool.length}
          />
        </>
      ) : (
        <QuizResult
          correctCount={correctCount}
          total={pool.length}
          wrongCount={wrongOnes.length}
          onRetest={handleRetest}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
