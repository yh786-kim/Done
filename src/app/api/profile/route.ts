import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// PATCH /api/profile  — 내 별명 변경
// body: { nickname: string }
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const nickname = (body.nickname || "").trim();

  if (!nickname) return NextResponse.json({ ok: false, error: "별명을 입력해주세요." }, { status: 400 });
  if (nickname.length > 20)
    return NextResponse.json({ ok: false, error: "별명은 20자 이내로 입력해주세요." }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id);

  if (error) return NextResponse.json({ ok: false, error: "변경 중 오류가 발생했습니다." }, { status: 500 });
  return NextResponse.json({ ok: true, nickname });
}
