import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendPushToUser } from "@/lib/push";
import { todayKST, nowHHMMKST, isActiveOnDate } from "@/lib/time";
import type { RequestRow } from "@/lib/data";

// 확인 전까지 반복해서 울리는 창(분). 예정 시각 이후 이 시간 동안 계속 재알림.
const RING_WINDOW_MIN = Number(process.env.RING_WINDOW_MIN || 30);
// 재알림 간격(분). 크론이 매분 돌 때 이 간격마다 다시 푸시.
const REPEAT_INTERVAL_MIN = Number(process.env.REPEAT_INTERVAL_MIN || 1);

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// GET /api/cron/tick  — 매분 호출. Authorization: Bearer <CRON_SECRET>
// 예정 시각이 지났고 아직 '완료'가 아닌 항목에 대해, 확인할 때까지 주기적으로 재알림.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const now = nowHHMMKST();
  const nowMin = toMin(now);
  const date = todayKST();

  // 활성 + 대상자 가입됨
  const { data: reqs } = await admin
    .from("requests")
    .select("*")
    .eq("enabled", true)
    .not("receiver_id", "is", null);

  // 오늘 활성 + 예정 시각이 지났고(ring 창 안) 항목만
  const candidates = (reqs || []).filter((r: RequestRow) => {
    if (!isActiveOnDate(r.days_of_week, date)) return false;
    const delta = nowMin - toMin(r.schedule_time);
    return delta >= 0 && delta <= RING_WINDOW_MIN;
  }) as RequestRow[];

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, time: now, date, due: 0, notified: 0 });
  }

  const ids = candidates.map((r) => r.id);
  const { data: logs } = await admin
    .from("check_logs")
    .select("request_id, status, notified_at")
    .in("request_id", ids)
    .eq("log_date", date);
  const logByReq = new Map((logs || []).map((l) => [l.request_id, l]));

  let notified = 0;
  const nowMs = Date.now();

  for (const r of candidates) {
    const log = logByReq.get(r.id);

    // 이미 완료했으면 더 이상 울리지 않음
    if (log?.status === "done") continue;

    // 로그가 없으면 pending 생성 (첫 예정 시각 도래)
    if (!log) {
      await admin.from("check_logs").insert({ request_id: r.id, log_date: date, status: "pending" });
    }

    // 재알림 간격 판단: 처음이거나(notified_at 없음) 마지막 알림 후 간격 경과 시
    const last = log?.notified_at ? new Date(log.notified_at).getTime() : 0;
    const dueToNotify = !last || nowMs - last >= REPEAT_INTERVAL_MIN * 60 * 1000;
    if (!dueToNotify) continue;

    const sent = await sendPushToUser(r.receiver_id!, {
      title: "Done 확인 요청",
      body: `${r.title} — 했으면 눌러서 확인해주세요`,
      url: "/me",
      tag: `req-${r.id}-${date}`,
      requestId: r.id,
      date,
    });

    await admin
      .from("check_logs")
      .update({ notified_at: new Date(nowMs).toISOString() })
      .eq("request_id", r.id)
      .eq("log_date", date);

    if (sent > 0) notified++;
  }

  return NextResponse.json({ ok: true, time: now, date, due: candidates.length, notified });
}
