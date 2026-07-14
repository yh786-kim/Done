import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizePhone, isValidPhone } from "@/lib/phone";
import { sendVerificationSms } from "@/lib/sms";

// POST /api/auth/request-link
// body: { phone: string, nickname?: string }
// 전화번호로 인증 매직링크를 발송한다. 신규 가입이면 nickname 필요.
export async function POST(req: Request) {
  const { phone: rawPhone, nickname } = await req.json().catch(() => ({}));
  const phone = normalizePhone(rawPhone || "");

  if (!isValidPhone(phone)) {
    return NextResponse.json({ ok: false, error: "올바른 휴대폰 번호를 입력해주세요." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("profiles")
    .select("id, nickname")
    .eq("phone", phone)
    .maybeSingle();

  const isNew = !existing;
  const nick = (nickname || "").trim();

  if (isNew && !nick) {
    // 신규 사용자인데 닉네임이 없으면 UI에 닉네임 입력을 요청
    return NextResponse.json({ ok: false, needNickname: true });
  }

  // 토큰 생성 (15분 유효)
  const token = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error: insErr } = await admin.from("verification_tokens").insert({
    token,
    phone,
    nickname: isNew ? nick : null,
    expires_at: expiresAt,
  });
  if (insErr) {
    return NextResponse.json({ ok: false, error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  const path = `/api/auth/verify?token=${token}`;
  // 화면 버튼용 링크는 "지금 접속한 주소"(Host 헤더) 기준 → PC/폰 어디서 열어도 동작.
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;
  const onScreenLink = `${origin}${path}`;
  // 실제 문자용 링크는 공개 주소(배포 도메인) 기준.
  const smsLink = `${process.env.NEXT_PUBLIC_APP_URL || origin}${path}`;

  const result = await sendVerificationSms(phone, smsLink);

  return NextResponse.json({
    ok: true,
    isNew,
    // 개발 모드(문자 미발송)에서는 링크를 그대로 돌려줘 바로 눌러볼 수 있게 함
    devLink: result.devLink ? onScreenLink : undefined,
  });
}
