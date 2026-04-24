export default function Card({ children, className = "" }) {
  return (
    <div className={`surface-card rounded-3xl border border-river/10 bg-white/80 shadow-glow ${className}`}>
      {children}
    </div>
  );
}
