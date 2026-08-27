export default function LoadingState() {
  return (
    <div className="sf-state-card sf-glass" role="status" aria-live="polite">
      <div className="sf-loading-orbit" aria-hidden="true">
        <div className="ring" />
        <div className="particle" />
        <div className="core" />
      </div>
      <p className="sf-loading-caption">Building your study set...</p>
      <p>Reading through your notes and drafting flashcards and quiz questions.</p>
    </div>
  );
}
