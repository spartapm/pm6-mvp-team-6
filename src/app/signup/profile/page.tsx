"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, uploadImage, MAX_IMAGE_BYTES } from "@/lib/store";
import {
  GENDER_LABEL,
  isValidNickname,
  nicknameError,
  formatBirthInput,
  birthError,
  type Gender,
} from "@/lib/types";
import { useToast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";
import { Avatar } from "@/components/Avatar";
import { CameraIcon, ChevronLeftIcon } from "@/components/icons";

const GENDERS: Gender[] = ["female", "male", "none"];

function ProfileSetup() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const email = params.get("email") ?? "";

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [birth, setBirth] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nicknameOk = isValidNickname(nickname);
  const nickError = nicknameError(nickname);
  const birthErr = birthError(birth);
  const canSubmit = nicknameOk && gender !== null && !birthErr && !submitting;

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast("이미지 용량이 너무 커요. 다른 사진을 선택해주세요.");
      return;
    }
    setUploading(true);
    try {
      setAvatarUrl(await uploadImage(file));
    } catch {
      toast("일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!nicknameOk) {
      toast("닉네임은 2~12자까지 입력할 수 있어요.");
      return;
    }
    if (!gender) {
      toast("성별을 선택해 주세요.");
      return;
    }
    if (birthErr) {
      toast(birthErr);
      return;
    }
    if (!email) {
      toast("이메일 정보가 없어요. 처음부터 다시 진행해 주세요.");
      router.replace("/signup/email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await signUp({
        email,
        nickname,
        gender,
        birth: birth.trim() || null,
        avatarUrl,
      });
      if (!res.ok) {
        toast(
          res.reason === "exists"
            ? "이미 가입된 이메일이에요. 로그인해 주세요."
            : res.reason === "nickname"
            ? "이미 사용 중인 닉네임이에요."
            : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
        );
        return;
      }
      router.replace("/map");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center px-2 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center text-ink"
          aria-label="뒤로"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="flex flex-1 flex-col px-6 pb-8">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative">
            <Avatar url={avatarUrl} size={88} />
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink shadow-card">
              {uploading ? <Spinner className="text-key" /> : <CameraIcon className="h-4 w-4" />}
              <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            </label>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="mt-8">
          <label className="text-xs font-medium text-sub">닉네임</label>
          <input
            autoFocus
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 12))}
            placeholder="닉네임을 입력해 주세요 (2~12자)"
            className={`mt-2 w-full border-b bg-transparent pb-2 text-lg outline-none placeholder:text-disabled ${
              nickError ? "border-like focus:border-like" : "border-line focus:border-key"
            }`}
          />
          {nickError && <p className="mt-2 text-xs text-like">{nickError}</p>}
        </div>

        {/* 성별 */}
        <div className="mt-7">
          <label className="text-xs font-medium text-sub">성별</label>
          <button
            onClick={() => setGenderOpen(true)}
            className={`mt-2 flex w-full items-center justify-between border-b border-line pb-2 text-lg ${
              gender ? "text-ink" : "text-disabled"
            }`}
          >
            {gender ? GENDER_LABEL[gender] : "선택"}
            <span className="text-sub">▾</span>
          </button>
        </div>

        {/* 생년월일 (선택) */}
        <div className="mt-7">
          <label className="text-xs font-medium text-sub">생년월일 (선택)</label>
          <input
            value={birth}
            inputMode="numeric"
            onChange={(e) => setBirth(formatBirthInput(e.target.value))}
            placeholder="YY-MM-DD"
            className={`mt-2 w-full border-b bg-transparent pb-2 text-lg outline-none placeholder:text-disabled ${
              birthErr ? "border-like focus:border-like" : "border-line focus:border-key"
            }`}
          />
          {birthErr && <p className="mt-2 text-xs text-like">{birthErr}</p>}
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-key py-4 text-base font-semibold text-white transition active:scale-[0.99] disabled:bg-disabled"
          >
            {submitting && <Spinner />}
            가입하기
          </button>
        </div>
      </div>

      {/* 성별 선택 바텀시트 */}
      {genderOpen && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[420px] flex-col justify-end">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setGenderOpen(false)}
            aria-label="닫기"
          />
          <div className="animate-sheet-up relative rounded-t-3xl bg-white p-2 pb-[max(env(safe-area-inset-bottom),12px)]">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGender(g);
                  setGenderOpen(false);
                }}
                className="flex w-full items-center justify-center py-4 text-lg font-medium hover:bg-field"
              >
                {GENDER_LABEL[g]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileSetup />
    </Suspense>
  );
}
