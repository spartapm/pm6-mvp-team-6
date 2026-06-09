import Image from "next/image";

export function NyamLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/nyam-logo.png"
      alt="nyam"
      width={164}
      height={39}
      priority
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
}
