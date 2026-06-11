"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/store";

const ONBOARDING_HIDE_KEY = "nyam.onboarding.hide.v2";

const slides = [
  "/onboarding/slide-1.png",
  "/onboarding/slide-2.png",
  "/onboarding/slide-3.png",
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [index, setIndex] = useState(0);
  const fromSignup = searchParams.get("from") === "signup";

  useEffect(() => {
    if (getSession() && !fromSignup) router.replace("/map");
  }, [router, fromSignup]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_HIDE_KEY, "1");
    }
    router.replace(fromSignup ? "/map" : "/login");
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f6f7f8] pb-4 pt-0">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div
              key={src}
              className="flex h-full w-full shrink-0 items-center justify-center overflow-hidden"
            >
              <Image
                src={src}
                alt="온보딩 화면"
                width={404}
                height={881}
                priority={i === 0}
                unoptimized
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
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

      <div className="mt-2 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={finish}
          className="text-[#9fa2a6] underline underline-offset-4"
          style={{
            fontFamily: '"Noto Sans KR", Pretendard, sans-serif',
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "11.52px",
            lineHeight: "100%",
            letterSpacing: "0",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
