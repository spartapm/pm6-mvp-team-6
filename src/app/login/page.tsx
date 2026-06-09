"use client";

import Link from "next/link";
import { NyamLogo } from "@/components/NyamLogo";

export default function LoginEntryPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-6">
      {/* status bar 여백 */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <NyamLogo className="h-12" />
        <p className="mt-4 text-sm text-sub">가고 싶은 곳, 다녀온 곳을 지도에 기록해요</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/signup/email"
          className="flex w-full items-center justify-center rounded-2xl bg-key py-4 text-base font-semibold text-white transition active:scale-[0.99]"
        >
          이메일로 시작
        </Link>
        <Link
          href="/login/email"
          className="flex w-full items-center justify-center rounded-2xl border border-line bg-white py-4 text-base font-semibold text-ink transition active:scale-[0.99]"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
