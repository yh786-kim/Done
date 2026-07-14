import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createRequest } from "@/lib/data";
import { normalizePhone, isValidPhone } from "@/lib/phone";

// POST /api/requests  요청(할일) 생성
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const receiverPhone = normalizePhone(body.receiverPhone || "");
  const title = (body.title || "").trim();
  const scheduleTime = (body.scheduleTime || "").trim();
  const daysOfWeek: number[] = Array.isArray(body.daysOfWeek) ? body.daysOfWeek : [];

  if (!isValidPhone(receiverPhone))
    return NextResponse.json({ ok: false, error: "대상자 휴대폰 번호가 올바르지 않습니다." }, { status: 400 });
  if (!title)
    return NextResponse.json({ ok: false, error: "확인할 내용을 입력해주세요." }, { status: 400 });
  if (!/^\d{2}:\d{2}$/.test(scheduleTime))
    return NextResponse.json({ ok: false, error: "시간을 선택해주세요." }, { status: 400 });
  if (receiverPhone === user.phone)
    return NextResponse.json({ ok: false, error: "본인에게는 요청할 수 없습니다." }, { status: 400 });

  const res = await createRequest({
    requesterId: user.id,
    receiverPhone,
    title,
    scheduleTime,
    daysOfWeek,
  });
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
