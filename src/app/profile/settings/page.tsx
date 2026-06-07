"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useSession";
import { clearSession, deleteAccount } from "@/lib/store";
import { useToast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";
import { ChevronLeftIcon } from "@/components/icons";

export default function SettingsPage() {
  const { user, ready } = useRequireAuth();
  const router = useRouter();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-key" />
      </div>
    );
  }

  const logout = () => {
    try {
      clearSession();
      router.replace("/login");
    } catch {
      toast("일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요");
    }
  };

  const withdraw = async () => {
    setWorking(true);
    try {
      await deleteAccount(user.id);
      router.replace("/login");
    } catch {
      toast("일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setWorking(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-1 border-b border-line px-2 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center text-ink"
          aria-label="뒤로"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-base font-semibold">설정</h1>
      </header>

      <div className="flex-1">
        <RowDisabled label="서비스 약관 및 방침" />
        <RowDisabled label="신고 / 문의하기" />
        <Row label="버전 정보" right={<span className="text-sm text-sub">0.1.0</span>} />
        <Row label="로그아웃" onClick={logout} />
        <Row label="회원탈퇴" danger onClick={() => setConfirmOpen(true)} />
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[420px] items-center justify-center px-8">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => !working && setConfirmOpen(false)}
            aria-label="닫기"
          />
          <div className="animate-pop-in relative w-full rounded-3xl bg-white p-6 text-center">
            <p className="text-base font-bold">정말 탈퇴할까요?</p>
            <p className="mt-2 text-sm leading-relaxed text-sub">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없어요
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={withdraw}
                disabled={working}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-like py-3.5 text-base font-semibold text-white disabled:opacity-60"
              >
                {working && <Spinner />}
                탈퇴하기
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={working}
                className="w-full rounded-2xl border border-line py-3.5 text-base font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  right,
  danger = false,
  onClick,
}: {
  label: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between border-b border-line px-5 py-4 text-left disabled:cursor-default"
    >
      <span className={`text-[15px] ${danger ? "text-like" : "text-ink"}`}>{label}</span>
      {right ?? (onClick && <span className="text-sub">›</span>)}
    </button>
  );
}

function RowDisabled({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center justify-between border-b border-line px-5 py-4">
      <span className="text-[15px] text-disabled">{label}</span>
      <span className="text-disabled">›</span>
    </div>
  );
}
