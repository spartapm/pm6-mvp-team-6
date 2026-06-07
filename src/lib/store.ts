"use client";

import { supabase, STORAGE_BUCKET } from "./supabase";
import type {
  Gender,
  KakaoPlace,
  Place,
  Review,
  SavedPlace,
  User,
} from "./types";

// =========================================================
// 세션 (MVP 데모용: localStorage)
// =========================================================
const SESSION_KEY = "nyam.session";

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(user: User) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

// =========================================================
// 사용자 매핑
// =========================================================
type UserRow = {
  id: string;
  email: string;
  nickname: string;
  gender: string | null;
  birth: string | null;
  avatar_url: string | null;
};

const mapUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  nickname: r.nickname,
  gender: (r.gender as Gender | null) ?? null,
  birth: r.birth,
  avatarUrl: r.avatar_url,
});

const USER_SELECT = "id, email, nickname, gender, birth, avatar_url";

// =========================================================
// 인증 (패스워드리스 데모)
// =========================================================
export async function emailExists(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return !!data;
}

export async function nicknameExists(
  nickname: string,
  excludeUserId?: string
): Promise<boolean> {
  let query = supabase.from("users").select("id").eq("nickname", nickname.trim());
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data } = await query.maybeSingle();
  return !!data;
}

// 로그인: 가입된 이메일이면 세션 생성
export async function signIn(
  email: string
): Promise<{ ok: true; user: User } | { ok: false; reason: "not_found" | "error" }> {
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) return { ok: false, reason: "error" };
  if (!data) return { ok: false, reason: "not_found" };
  const user = mapUser(data as UserRow);
  setSession(user);
  return { ok: true, user };
}

// 회원가입: 이메일 인증 완료 + 프로필 입력 후 호출
export async function signUp(input: {
  email: string;
  nickname: string;
  gender: Gender;
  birth: string | null;
  avatarUrl: string | null;
}): Promise<{ ok: true; user: User } | { ok: false; reason: "exists" | "nickname" | "error" }> {
  const email = input.email.trim().toLowerCase();
  if (await emailExists(email)) return { ok: false, reason: "exists" };
  if (await nicknameExists(input.nickname)) return { ok: false, reason: "nickname" };
  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      nickname: input.nickname.trim(),
      gender: input.gender,
      birth: input.birth,
      avatar_url: input.avatarUrl,
    })
    .select(USER_SELECT)
    .single();
  if (error || !data) return { ok: false, reason: "error" };
  const user = mapUser(data as UserRow);
  setSession(user);
  return { ok: true, user };
}

export async function updateProfile(
  userId: string,
  input: { nickname: string; avatarUrl: string | null }
): Promise<{ ok: true; user: User } | { ok: false; reason: "nickname" | "error" }> {
  if (await nicknameExists(input.nickname, userId)) {
    return { ok: false, reason: "nickname" };
  }
  const { data, error } = await supabase
    .from("users")
    .update({ nickname: input.nickname.trim(), avatar_url: input.avatarUrl })
    .eq("id", userId)
    .select(USER_SELECT)
    .single();
  if (error || !data) return { ok: false, reason: "error" };
  const user = mapUser(data as UserRow);
  setSession(user);
  return { ok: true, user };
}

export async function deleteAccount(userId: string): Promise<void> {
  await supabase.from("users").delete().eq("id", userId);
  clearSession();
}

// =========================================================
// 장소 매핑 / upsert
// =========================================================
type PlaceRow = {
  id: string;
  kakao_id: string;
  name: string;
  category: string | null;
  address: string | null;
  road_address: string | null;
  phone: string | null;
  place_url: string | null;
  lat: number;
  lng: number;
};

const mapPlace = (r: PlaceRow): Place => ({
  id: r.id,
  kakaoId: r.kakao_id,
  name: r.name,
  category: r.category ?? "",
  address: r.address ?? "",
  roadAddress: r.road_address ?? "",
  phone: r.phone ?? "",
  placeUrl: r.place_url ?? "",
  lat: r.lat,
  lng: r.lng,
});

// 카카오 장소를 DB 에 저장(있으면 가져오기)
export async function upsertPlace(p: KakaoPlace): Promise<Place> {
  const existing = await supabase
    .from("places")
    .select("*")
    .eq("kakao_id", p.kakaoId)
    .maybeSingle();
  if (existing.data) return mapPlace(existing.data as PlaceRow);

  const { data, error } = await supabase
    .from("places")
    .insert({
      kakao_id: p.kakaoId,
      name: p.name,
      category: p.category,
      address: p.address,
      road_address: p.roadAddress,
      phone: p.phone,
      place_url: p.placeUrl,
      lat: p.lat,
      lng: p.lng,
    })
    .select("*")
    .single();
  if (error || !data) {
    // 동시 insert 충돌 시 재조회
    const retry = await supabase
      .from("places")
      .select("*")
      .eq("kakao_id", p.kakaoId)
      .maybeSingle();
    if (retry.data) return mapPlace(retry.data as PlaceRow);
    throw error ?? new Error("upsert place failed");
  }
  return mapPlace(data as PlaceRow);
}

export async function getPlace(placeId: string): Promise<Place | null> {
  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("id", placeId)
    .maybeSingle();
  return data ? mapPlace(data as PlaceRow) : null;
}

// =========================================================
// 북마크 (회색 별)
// =========================================================
export async function isBookmarked(
  userId: string,
  placeId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();
  return !!data;
}

// 북마크 토글 → 최종 북마크 여부 반환
export async function toggleBookmark(
  userId: string,
  placeId: string
): Promise<boolean> {
  if (await isBookmarked(userId, placeId)) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("place_id", placeId);
    return false;
  }
  await supabase.from("bookmarks").insert({ user_id: userId, place_id: placeId });
  return true;
}

// =========================================================
// 내가 저장한 장소 (지도 마커)
// =========================================================
export async function getMySavedPlaces(userId: string): Promise<SavedPlace[]> {
  const [bm, rv] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("places(*)")
      .eq("user_id", userId),
    supabase
      .from("reviews")
      .select("places(*)")
      .eq("user_id", userId),
  ]);

  const byId = new Map<string, SavedPlace>();

  const addRows = (
    rows: { places: PlaceRow | null }[] | null,
    star: "gray" | "fill"
  ) => {
    (rows ?? []).forEach((row) => {
      const pr = row.places;
      if (!pr) return;
      const existing = byId.get(pr.id);
      // 리뷰(fill)가 북마크(gray)보다 우선
      if (existing && existing.star === "fill") return;
      byId.set(pr.id, { ...mapPlace(pr), star });
    });
  };

  addRows(bm.data as unknown as { places: PlaceRow | null }[], "gray");
  addRows(rv.data as unknown as { places: PlaceRow | null }[], "fill");

  return Array.from(byId.values());
}

// 프로필 별 개수: 빈별(=북마크) / 채운별(=리뷰 장소)
export async function getStarCounts(
  userId: string
): Promise<{ bookmark: number; review: number }> {
  const [bm, rv] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase.from("reviews").select("place_id").eq("user_id", userId),
  ]);
  const reviewPlaces = new Set(
    ((rv.data ?? []) as { place_id: string }[]).map((r) => r.place_id)
  );
  return { bookmark: bm.count ?? 0, review: reviewPlaces.size };
}

// =========================================================
// 리뷰
// =========================================================
type ReviewRow = {
  id: string;
  user_id: string;
  place_id: string;
  content: string;
  created_at: string;
  users: { nickname: string; avatar_url: string | null } | null;
  places: { name: string } | null;
  review_images: { url: string; order_index: number }[] | null;
  likes: { user_id: string }[] | null;
};

const REVIEW_SELECT = `
  id, user_id, place_id, content, created_at,
  users:user_id ( nickname, avatar_url ),
  places:place_id ( name ),
  review_images ( url, order_index ),
  likes ( user_id )
`;

const mapReview = (r: ReviewRow, myUserId: string | null): Review => {
  const images = (r.review_images ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((i) => i.url);
  const likes = r.likes ?? [];
  return {
    id: r.id,
    userId: r.user_id,
    authorNickname: r.users?.nickname ?? "user",
    authorAvatarUrl: r.users?.avatar_url ?? null,
    placeId: r.place_id,
    placeName: r.places?.name ?? "",
    content: r.content,
    images,
    likeCount: likes.length,
    likedByMe: myUserId ? likes.some((l) => l.user_id === myUserId) : false,
    createdAt: r.created_at,
  };
};

export async function getReviewsByPlace(
  placeId: string,
  myUserId: string | null
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ReviewRow[]).map((r) => mapReview(r, myUserId));
}

export async function getMyReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ReviewRow[]).map((r) => mapReview(r, userId));
}

export async function getReview(
  reviewId: string,
  myUserId: string | null
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("id", reviewId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapReview(data as unknown as ReviewRow, myUserId);
}

export async function createReview(input: {
  userId: string;
  placeId: string;
  content: string;
  images: string[];
}): Promise<string> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: input.userId,
      place_id: input.placeId,
      content: input.content,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("create review failed");
  const reviewId = data.id as string;
  await saveReviewImages(reviewId, input.images);
  return reviewId;
}

export async function updateReview(input: {
  reviewId: string;
  content: string;
  images: string[];
}): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .update({ content: input.content, updated_at: new Date().toISOString() })
    .eq("id", input.reviewId);
  if (error) throw error;
  // 이미지 전체 교체
  await supabase.from("review_images").delete().eq("review_id", input.reviewId);
  await saveReviewImages(input.reviewId, input.images);
}

async function saveReviewImages(reviewId: string, images: string[]) {
  if (images.length === 0) return;
  const rows = images.slice(0, 3).map((url, i) => ({
    review_id: reviewId,
    url,
    order_index: i,
  }));
  const { error } = await supabase.from("review_images").insert(rows);
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await supabase.from("reviews").delete().eq("id", reviewId);
}

// =========================================================
// 좋아요
// =========================================================
// 토글 → 최종 좋아요 여부 반환
export async function toggleLike(
  userId: string,
  reviewId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("review_id", reviewId)
    .maybeSingle();
  if (data) {
    await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("review_id", reviewId);
    return false;
  }
  await supabase.from("likes").insert({ user_id: userId, review_id: reviewId });
  return true;
}

// =========================================================
// 이미지 업로드 (Supabase Storage)
// =========================================================
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
