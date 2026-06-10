import Image from "next/image";

export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/nyam-logo.png"
      alt="nook"
      width={300}
      height={104}
      priority
      quality={100}
      unoptimized
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
}
