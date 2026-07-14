import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getRememberedPhone,
  getCurrentUser,
  setSession,
  setRemembered,
} from "@/lib/auth";

// POST /api/auth/quick-login
// '시작' 버튼: 기억된(서명된) 전화번호로 링크 없이 바로 세션을 복구한다.
export async function POST(req: Request) {
  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const admin = getSupabaseAdmin();

  // 1) 기억 쿠키의 전화번호 우선
  const phone = await getRememberedPhone();
  if (phone) {
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    if (profile) {
      await setSession(profile.id);
      await setRemembered(profile.phone);
      return NextResponse.json({ ok: true, redirect: new URL("/home", base).toString() });
    }
  }

  // 2) 기억 쿠키가 없지만 이미 유효한 세션이 있으면 그대로 진행 + 기억 저장
  const user = await getCurrentUser();
  if (user) {
    await setSession(user.id);
    await setRemembered(user.phone);
    return NextResponse.json({ ok: true, redirect: new URL("/home", base).toString() });
  }

  return NextResponse.json(
    { ok: false, error: "다시 로그인해주세요." },
    { status: 401 }
  );
}
