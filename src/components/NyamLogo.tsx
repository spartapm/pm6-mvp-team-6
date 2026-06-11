export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/nook-logo-v2.png?v=20260610-2342"
      alt="nook"
      width={1024}
      height={355}
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
}
