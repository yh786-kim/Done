import "server-only";
import webpush from "web-push";
import { getSupabaseAdmin } from "./supabase";

let configured = false;
function ensureConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(subject, pub, priv);
    configured = true;
  }
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requestId?: string; // 알림에서 바로 '완료' 처리할 대상
  date?: string;
};

// 특정 사용자의 모든 구독으로 푸시 발송. 만료(410/404)된 구독은 삭제.
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) {
    console.warn("[push] VAPID 키가 없어 푸시를 건너뜁니다.");
    return 0;
  }
  const admin = getSupabaseAdmin();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return 0;

  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys } as webpush.PushSubscription,
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        } else {
          console.error("[push] 발송 실패:", code, err);
        }
      }
    })
  );
  return sent;
}
