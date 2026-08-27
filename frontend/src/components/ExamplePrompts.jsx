const EXAMPLES = [
  "The French Revolution, causes and key events",
  "React useEffect and the dependency array",
  "Java inheritance and polymorphism",
  "Krebs cycle, step by step",
];

export default function ExamplePrompts({ onPick, disabled }) {
  return (
    <div className="sf-examples">
      <p className="sf-eyebrow sf-examples-label">Or try one of these</p>
      <div className="sf-chip-row">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="sf-chip"
            onClick={() => onPick(ex)}
            disabled={disabled}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
