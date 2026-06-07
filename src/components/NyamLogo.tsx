export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-sans font-extrabold tracking-tight text-key ${className}`}
      style={{ letterSpacing: "-0.04em" }}
    >
      nyam
    </span>
  );
}
