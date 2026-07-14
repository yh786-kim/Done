import "server-only";

// 문자 발송 추상화.
// SMS_PROVIDER 가 비어있으면(mock) 실제 발송 대신 콘솔에 출력하고, 링크를 호출부로 되돌려준다.
// 실제 서비스에서는 Solapi 등을 연동한다.

export type SmsResult = { sent: boolean; devLink?: string };

export async function sendVerificationSms(phone: string, link: string): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || "").toLowerCase();

  if (!provider) {
    // 개발 모드: 실제 발송하지 않고 링크를 화면/콘솔로 노출
    console.log(`\n[개발용 인증링크] ${phone} → ${link}\n`);
    return { sent: false, devLink: link };
  }

  if (provider === "solapi") {
    await sendViaSolapi(phone, `[Done] 로그인 링크: ${link}`);
    return { sent: true };
  }

  throw new Error(`알 수 없는 SMS_PROVIDER: ${provider}`);
}

// Solapi 연동 (참고용 최소 구현). 실제 사용 전 발신번호 등록/키 발급 필요.
async function sendViaSolapi(to: string, text: string): Promise<void> {
  const crypto = await import("crypto");
  const apiKey = process.env.SOLAPI_API_KEY!;
  const apiSecret = process.env.SOLAPI_API_SECRET!;
  const from = process.env.SOLAPI_SENDER!;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: { to, from, text } }),
  });
  if (!res.ok) {
    throw new Error(`Solapi 발송 실패: ${res.status} ${await res.text()}`);
  }
}
