// ---------- 도메인 타입 ----------

export type Gender = "female" | "male" | "none";

export interface User {
  id: string;
  email: string;
  nickname: string; // 2~12자
  gender: Gender | null;
  birth: string | null; // YY-MM-DD
  avatarUrl: string | null;
}

// 카카오 키워드 검색 결과 (저장 전)
export interface KakaoPlace {
  kakaoId: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  placeUrl: string;
  lat: number;
  lng: number;
}

// DB 에 저장된 장소
export interface Place extends KakaoPlace {
  id: string;
}

// 장소의 내 별 상태
export type StarState = "empty" | "gray" | "fill";
// empty: 저장 안 함 / gray: 북마크만 / fill: 리뷰 작성

// 지도 위 마커용 (내가 저장한 장소)
export interface SavedPlace extends Place {
  star: "gray" | "fill"; // 지도엔 저장된 것만 → empty 제외
}

export interface ReviewImage {
  url: string;
  orderIndex: number;
}

export interface Review {
  id: string;
  userId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  placeId: string;
  placeName: string;
  content: string;
  images: string[]; // 최대 3장
  likeCount: number;
  likedByMe: boolean;
  createdAt: string; // ISO
}

// ---------- 유틸 ----------

// YYYY.MM.DD
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

// 닉네임 규칙: 한글/영문 포함 2~12자
export function isValidNickname(v: string): boolean {
  const t = v.trim();
  return t.length >= 2 && t.length <= 12;
}

// 리뷰 본문: 공백 포함 15~100자
export const REVIEW_MIN = 15;
export const REVIEW_MAX = 100;
export function reviewLengthError(v: string): string | null {
  const len = v.length;
  if (len < REVIEW_MIN) return "15자 이상으로 입력해 주세요.";
  if (len > REVIEW_MAX) return "100자 이내로 입력해주세요.";
  return null;
}

// 이메일 형식
export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export const GENDER_LABEL: Record<Gender, string> = {
  female: "여성",
  male: "남성",
  none: "선택안함",
};
