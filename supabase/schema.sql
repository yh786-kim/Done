-- Done 앱 데이터베이스 스키마
-- Supabase SQL 편집기에 붙여넣고 실행하세요.
-- (모든 서버 접근은 service_role 키로 이루어지며, RLS는 켜두되 정책은 두지 않아 기본 차단됩니다.)

-- ============ 확장 ============
create extension if not exists "pgcrypto";

-- ============ 프로필(사용자) ============
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  phone       text not null unique,
  created_at  timestamptz not null default now()
);

-- ============ 매직링크 인증 토큰 ============
create table if not exists verification_tokens (
  token       text primary key,
  phone       text not null,
  nickname    text,                         -- 신규 가입 시 사용할 닉네임
  expires_at  timestamptz not null,
  consumed    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============ 확인 요청(할일 항목) ============
-- requester(요청자)가 receiver(대상자)에게 "이거 했니?"를 특정 시간에 물어봄
create table if not exists requests (
  id             uuid primary key default gen_random_uuid(),
  requester_id   uuid not null references profiles(id) on delete cascade,
  receiver_id    uuid references profiles(id) on delete set null,  -- 아직 미가입이면 null
  receiver_phone text not null,                                    -- 대상자 전화번호(가입 전 매칭용)
  title          text not null,                                    -- 예: "양치했니?"
  schedule_time  text not null,                                    -- 'HH:MM' (Asia/Seoul 기준)
  days_of_week   int[] not null default '{}',                      -- 비어있으면 매일, 아니면 0(일)~6(토)
  enabled        boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists idx_requests_receiver on requests(receiver_id);
create index if not exists idx_requests_requester on requests(requester_id);
create index if not exists idx_requests_receiver_phone on requests(receiver_phone);

-- ============ 확인 결과(날짜별) ============
create table if not exists check_logs (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references requests(id) on delete cascade,
  log_date    date not null,                             -- 해당 날짜(Asia/Seoul)
  status      text not null default 'pending',           -- 'pending' | 'done'
  done_at     timestamptz,
  photo_url   text,                                      -- 추후: 인증 사진
  notified_at timestamptz,                               -- 푸시 발송 시각(중복 발송 방지)
  created_at  timestamptz not null default now(),
  unique (request_id, log_date)
);
create index if not exists idx_check_logs_request_date on check_logs(request_id, log_date);

-- ============ 웹 푸시 구독 ============
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  endpoint    text not null unique,
  keys        jsonb not null,                            -- { p256dh, auth }
  created_at  timestamptz not null default now()
);
create index if not exists idx_push_user on push_subscriptions(user_id);

-- ============ RLS 활성화(정책 없음 = service_role만 접근) ============
alter table profiles            enable row level security;
alter table verification_tokens enable row level security;
alter table requests            enable row level security;
alter table check_logs          enable row level security;
alter table push_subscriptions  enable row level security;
