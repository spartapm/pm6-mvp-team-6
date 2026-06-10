"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (getSession()) router.replace("/map");
  }, [router]);

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_HIDE_KEY, "1");
    }
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] px-4 pb-10 pt-4 sm:min-h-[calc(100vh-3rem)]">
      <div className="flex-1 overflow-hidden rounded-[26px]">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={src} className="flex h-full w-full shrink-0 items-center justify-center">
              <Image
                src={src}
                alt="온보딩 화면"
                width={406}
                height={883}
                priority={i === 0}
                unoptimized
                className="h-full w-auto max-w-full object-contain"
              />
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
