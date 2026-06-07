"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";
import { NyamLogo } from "@/components/NyamLogo";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getSession() ? "/map" : "/login");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <NyamLogo className="text-4xl opacity-90" />
    </div>
  );
}
