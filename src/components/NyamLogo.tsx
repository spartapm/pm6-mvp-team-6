export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="nook"
      className={`inline-flex items-center justify-center font-semibold tracking-[0.14em] text-ink ${className}`}
    >
      NOOK
    </div>
  );
}
