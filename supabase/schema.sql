-- =========================================================
-- nyam (team-6) 스키마
-- Supabase SQL Editor 에 붙여넣어 1회 실행하세요.
-- 데모 콘텐츠는 seed_content.sql 참고.
-- =========================================================

-- 확장 (uuid 생성)
create extension if not exists "pgcrypto";

-- ---------- 사용자 ----------
-- MVP 데모용: 패스워드리스(이메일 인증) 시뮬레이션. 실제 메일 발송 없음.
-- ※ 운영 단계에서는 Supabase Auth(매직링크/OTP) 전환 권장.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nickname text not null,                 -- 2~12자
  gender text,                            -- 'female' | 'male' | 'none'
  birth text,                             -- 'YY-MM-DD' (선택)
  avatar_url text,                        -- 없으면 기본 이미지
  created_at timestamptz not null default now()
);

-- ---------- 장소 (카카오 로컬 검색 결과를 저장) ----------
-- 사용자가 북마크/리뷰할 때 upsert 된다.
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  kakao_id text not null unique,          -- 카카오 place id
  name text not null,                     -- 상호명 (place_name)
  category text,                          -- 카테고리 (category_name)
  address text,                           -- 지번 주소 (address_name)
  road_address text,                      -- 도로명 주소 (road_address_name)
  phone text,                             -- 전화번호
  place_url text,                         -- 카카오 장소 링크
  lat double precision not null,          -- 위도 (y)
  lng double precision not null,          -- 경도 (x)
  created_at timestamptz not null default now()
);

-- ---------- 북마크 (빈/회색 별: 단순 장소 저장) ----------
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

-- ---------- 리뷰 (채운 별: 리뷰 작성 장소) ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  content text not null,                  -- 공백 포함 15~100자
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 리뷰 이미지 (최대 3장) ----------
create table if not exists review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  url text not null,
  order_index int not null default 0
);

-- ---------- 좋아요 (리뷰 ← 사용자) ----------
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  review_id uuid not null references reviews(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, review_id)
);

-- ---------- 그룹 (공유 지도) ----------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,                     -- 그룹 이름
  invite_code text not null unique,       -- 초대 코드 (6자)
  owner_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- 그룹 멤버 ----------
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  color text not null,                    -- 지도 마커 색상 (멤버별)
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- ---------- 인덱스 ----------
create index if not exists idx_bookmarks_user on bookmarks(user_id);
create index if not exists idx_reviews_user on reviews(user_id);
create index if not exists idx_reviews_place on reviews(place_id);
create index if not exists idx_reviews_created on reviews(created_at desc);
create index if not exists idx_review_images_review on review_images(review_id);
create index if not exists idx_likes_review on likes(review_id);
create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_group_members_user on group_members(user_id);
create index if not exists idx_groups_invite on groups(invite_code);

-- ---------- RLS (MVP 데모용: anon 전체 허용) ----------
-- ※ 운영 단계에서는 사용자별 정책으로 강화하세요.
alter table users enable row level security;
alter table places enable row level security;
alter table bookmarks enable row level security;
alter table reviews enable row level security;
alter table review_images enable row level security;
alter table likes enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;

do $$
declare t text;
begin
  foreach t in array array['users','places','bookmarks','reviews','review_images','likes','groups','group_members']
  loop
    execute format('drop policy if exists "anon all %1$s" on %1$s;', t);
    execute format('create policy "anon all %1$s" on %1$s for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ---------- Storage 버킷 (이미지 업로드) ----------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'images');

drop policy if exists "images anon write" on storage.objects;
create policy "images anon write" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'images');

drop policy if exists "images anon delete" on storage.objects;
create policy "images anon delete" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'images');
