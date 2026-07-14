import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트 (service_role 키 사용 → RLS 우회).
// 인증/권한 검사는 애플리케이션 코드(src/lib/auth.ts 등)에서 직접 수행한다.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local 의 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 채워주세요."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
