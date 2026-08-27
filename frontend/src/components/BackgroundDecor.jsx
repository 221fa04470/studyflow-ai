// Purely decorative — subtle floating 3D shapes behind the content.
// Animation is disabled globally via prefers-reduced-motion in styles.css.
export default function BackgroundDecor() {
  return (
    <div className="sf-decor" aria-hidden="true">
      <div className="sf-decor-shape s1" />
      <div className="sf-decor-shape s2" />
      <div className="sf-decor-shape s3" />
      <div className="sf-decor-shape s4" />
    </div>
  );
}
