"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/store";

const ONBOARDING_HIDE_KEY = "nyam.onboarding.hide";

const slides = [
  "/onboarding/slide-1.png",
  "/onboarding/slide-2.png",
  "/onboarding/slide-3.png",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [hideNextTime, setHideNextTime] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/map");
  }, [router]);

  const finish = () => {
    if (typeof window !== "undefined") {
      if (hideNextTime) {
        window.localStorage.setItem(ONBOARDING_HIDE_KEY, "1");
      } else {
        window.localStorage.removeItem(ONBOARDING_HIDE_KEY);
      }
    }
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] px-4 pb-10 pt-4 sm:min-h-[calc(100vh-3rem)]">
      <div className="flex-1 overflow-hidden rounded-[26px]">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ width: `${slides.length * 100}%`, transform: `translateX(-${index * (100 / slides.length)}%)` }}
        >
          {slides.map((src) => (
            <div key={src} className="relative h-full w-full">
              <Image src={src} alt="온보딩 화면" fill className="object-contain" priority />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`${i + 1}번째 온보딩`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-key" : "w-2.5 bg-black/15"}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={finish}
          className="text-lg font-medium text-[#9fa2a6] underline underline-offset-4"
        >
          건너뛰기
        </button>
        <label className="flex items-center gap-2 text-sm text-[#9fa2a6]">
          <input
            type="checkbox"
            checked={hideNextTime}
            onChange={(e) => setHideNextTime(e.target.checked)}
            className="h-4 w-4 accent-key"
          />
          다시보지않기
        </label>
      </div>
    </div>
  );
}
