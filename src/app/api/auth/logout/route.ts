import { NextResponse } from "next/server";
import { clearSession, clearRemembered } from "@/lib/auth";

export async function POST(req: Request) {
  await clearSession();
  await clearRemembered();
  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  return NextResponse.json({ ok: true, redirect: new URL("/login", base).toString() });
}
