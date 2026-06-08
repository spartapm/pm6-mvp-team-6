-- =========================================================
-- nyam (team-6) 그룹(공유 지도) 마이그레이션
-- Supabase SQL Editor 에 붙여넣어 1회 실행하세요.
-- schema.sql 을 이미 실행한 프로젝트에 추가로 적용하는 용도입니다.
-- =========================================================

-- ---------- 그룹 ----------
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

create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_group_members_user on group_members(user_id);
create index if not exists idx_groups_invite on groups(invite_code);

-- ---------- RLS (MVP 데모용: anon 전체 허용) ----------
alter table groups enable row level security;
alter table group_members enable row level security;

do $$
declare t text;
begin
  foreach t in array array['groups','group_members']
  loop
    execute format('drop policy if exists "anon all %1$s" on %1$s;', t);
    execute format('create policy "anon all %1$s" on %1$s for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;
