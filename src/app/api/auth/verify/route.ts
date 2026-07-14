import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { setSession, setRemembered } from "@/lib/auth";

// GET /api/auth/verify?token=...
// 매직링크 클릭 시 호출. 토큰 검증 → 프로필 생성/조회 → 세션 설정 → /home 이동.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!token) return redirectTo(base, "/login?error=notoken");

  const admin = getSupabaseAdmin();
  const { data: vt } = await admin
    .from("verification_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!vt || vt.consumed || new Date(vt.expires_at).getTime() < Date.now()) {
    return redirectTo(base, "/login?error=expired");
  }

  // 토큰 소비 처리
  await admin.from("verification_tokens").update({ consumed: true }).eq("token", token);

  // 프로필 조회 또는 생성
  let { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("phone", vt.phone)
    .maybeSingle();

  if (!profile) {
    const { data: created, error } = await admin
      .from("profiles")
      .insert({ phone: vt.phone, nickname: vt.nickname || "사용자" })
      .select("*")
      .single();
    if (error || !created) return redirectTo(base, "/login?error=create");
    profile = created;

    // 이 번호로 미리 등록돼 있던 요청들을 새 프로필에 연결
    await admin
      .from("requests")
      .update({ receiver_id: profile.id })
      .eq("receiver_phone", vt.phone)
      .is("receiver_id", null);
  }

  await setSession(profile.id);
  await setRemembered(profile.phone); // 다음엔 '시작'으로 바로 로그인
  return redirectTo(base, "/home");
}

function redirectTo(base: string, path: string) {
  return NextResponse.redirect(new URL(path, base));
}
