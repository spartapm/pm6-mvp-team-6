"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";
import { NyamLogo } from "@/components/NyamLogo";

const ONBOARDING_SEEN_KEY = "nyam.onboarding.seen";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    if (getSession()) {
      router.replace("/map");
      return;
    }
    const seen = window.localStorage.getItem(ONBOARDING_SEEN_KEY) === "1";
    router.replace(seen ? "/login" : "/onboarding");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <NyamLogo className="h-11 opacity-90" />
    </div>
  );
}
