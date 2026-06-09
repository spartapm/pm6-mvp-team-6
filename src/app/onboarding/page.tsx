"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NyamLogo } from "@/components/NyamLogo";
import { getSession } from "@/lib/store";

const ONBOARDING_SEEN_KEY = "nyam.onboarding.seen";

const slides = [
  "/onboarding/slide-1.png",
  "/onboarding/slide-2.png",
  "/onboarding/slide-3.png",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (getSession()) router.replace("/map");
  }, [router]);

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    }
    router.replace("/login");
  };

  const goNext = () => {
    if (index >= slides.length - 1) {
      finish();
      return;
    }
    setIndex((v) => v + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] px-6 pb-10 pt-6 sm:min-h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-center">
        <NyamLogo className="h-8 opacity-20" />
      </div>

      <div className="mt-8 flex-1 overflow-hidden rounded-[26px] border border-black/10 bg-white/40">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ width: `${slides.length * 100}%`, transform: `translateX(-${index * (100 / slides.length)}%)` }}
        >
          {slides.map((src) => (
            <div key={src} className="relative h-full w-full">
              <Image src={src} alt="온보딩 화면" fill className="object-cover" priority />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-key" : "w-2.5 bg-black/15"}`}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={finish}
          className="h-12 flex-1 rounded-xl border border-line bg-white text-sm font-semibold text-sub transition active:scale-[0.99]"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={goNext}
          className="h-12 flex-1 rounded-xl bg-key text-sm font-semibold text-white transition active:scale-[0.99]"
        >
          {index === slides.length - 1 ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
}
