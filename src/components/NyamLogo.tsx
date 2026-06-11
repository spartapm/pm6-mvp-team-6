import Image from "next/image";

export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/nook-logo-v2.png"
      alt="nook"
      width={1024}
      height={355}
      priority
      quality={100}
      unoptimized
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
}
