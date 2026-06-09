"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";
import { NyamLogo } from "@/components/NyamLogo";

const ONBOARDING_HIDE_KEY = "nyam.onboarding.hide.v2";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    if (getSession()) {
      router.replace("/map");
      return;
    }
    const hidden = window.localStorage.getItem(ONBOARDING_HIDE_KEY) === "1";
    router.replace(hidden ? "/login" : "/onboarding");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <NyamLogo className="h-11 opacity-90" />
    </div>
  );
}
