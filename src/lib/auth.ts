import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase";

const COOKIE_NAME = "done_session";
const REMEMBER_COOKIE = "done_remember";
const MAX_AGE = 60 * 60 * 24 * 400; // 400일 (브라우저 쿠키 최대 수명). 로그인 상태 장기 유지.

export type Profile = {
  id: string;
  nickname: string;
  phone: string;
  created_at: string;
};

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET 환경변수가 없습니다.");
  return s;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

// 서명된 토큰 생성: payload.signature  (payload 는 임의 객체)
function signPayload(obj: Record<string, unknown>): string {
  const payload = b64url(JSON.stringify({ ...obj, iat: Date.now() }));
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyPayload(token: string | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null; // 타이밍 안전 비교
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

// ===== 세션 =====
export async function setSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, signPayload({ uid: userId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<Profile | null> {
  const jar = await cookies();
  const p = verifyPayload(jar.get(COOKIE_NAME)?.value);
  const uid = p && typeof p.uid === "string" ? p.uid : null;
  if (!uid) return null;

  const { data } = await getSupabaseAdmin()
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  return (data as Profile) ?? null;
}

// ===== "기억하기" (다음에 링크 없이 '시작'으로 바로 로그인) =====
// 로그인에 성공하면 서명된 전화번호를 오래 저장한다. 위조는 불가(서명).
export async function setRemembered(phone: string): Promise<void> {
  const jar = await cookies();
  jar.set(REMEMBER_COOKIE, signPayload({ phone }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getRememberedPhone(): Promise<string | null> {
  const jar = await cookies();
  const p = verifyPayload(jar.get(REMEMBER_COOKIE)?.value);
  return p && typeof p.phone === "string" ? p.phone : null;
}

export async function clearRemembered(): Promise<void> {
  const jar = await cookies();
  jar.delete(REMEMBER_COOKIE);
}
