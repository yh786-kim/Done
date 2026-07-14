import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleCheck } from "@/lib/data";
import { todayKST } from "@/lib/time";

// POST /api/checks  확인 완료/취소
// body: { requestId, date?, done }
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const requestId = body.requestId as string;
  const date = (body.date as string) || todayKST();
  const done = body.done !== false; // 기본 true

  if (!requestId) return NextResponse.json({ ok: false, error: "requestId가 필요합니다." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ ok: false, error: "날짜 형식이 올바르지 않습니다." }, { status: 400 });

  const ok = await toggleCheck(user.id, requestId, date, done);
  if (!ok) return NextResponse.json({ ok: false, error: "권한이 없거나 항목이 없습니다." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
