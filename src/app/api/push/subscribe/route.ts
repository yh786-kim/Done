import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST /api/push/subscribe  브라우저 푸시 구독 저장
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys)
    return NextResponse.json({ ok: false, error: "구독 정보가 올바르지 않습니다." }, { status: 400 });

  const { error } = await getSupabaseAdmin().from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      keys: sub.keys,
    },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
