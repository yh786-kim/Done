import "server-only";
import { getSupabaseAdmin } from "./supabase";
import { isActiveOnDate } from "./time";

export type RequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string | null;
  receiver_phone: string;
  title: string;
  schedule_time: string;
  days_of_week: number[];
  enabled: boolean;
  created_at: string;
};

export type CheckStatus = "pending" | "done";

// ===== 요청 받는 사람(내가 할일) 관점 =====
export type ReceiverItem = {
  requestId: string;
  title: string;
  scheduleTime: string;
  requesterNickname: string;
  status: CheckStatus;
  doneAt: string | null;
  photoUrl: string | null;
};

export async function getReceiverItems(userId: string, date: string): Promise<ReceiverItem[]> {
  const admin = getSupabaseAdmin();

  const { data: reqs } = await admin
    .from("requests")
    .select("*")
    .eq("receiver_id", userId)
    .eq("enabled", true);

  const active = (reqs || []).filter((r: RequestRow) => isActiveOnDate(r.days_of_week, date));
  if (active.length === 0) return [];

  const requestIds = active.map((r) => r.id);
  const requesterIds = [...new Set(active.map((r) => r.requester_id))];

  const [{ data: logs }, { data: requesters }] = await Promise.all([
    admin.from("check_logs").select("*").in("request_id", requestIds).eq("log_date", date),
    admin.from("profiles").select("id, nickname").in("id", requesterIds),
  ]);

  const logByReq = new Map((logs || []).map((l) => [l.request_id, l]));
  const nickById = new Map((requesters || []).map((p) => [p.id, p.nickname]));

  return active
    .map((r: RequestRow) => {
      const log = logByReq.get(r.id);
      return {
        requestId: r.id,
        title: r.title,
        scheduleTime: r.schedule_time,
        requesterNickname: nickById.get(r.requester_id) || "요청자",
        status: (log?.status as CheckStatus) || "pending",
        doneAt: log?.done_at ?? null,
        photoUrl: log?.photo_url ?? null,
      };
    })
    .sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
}

// 확인 완료/취소 토글. 대상자 본인만 가능.
export async function toggleCheck(
  userId: string,
  requestId: string,
  date: string,
  done: boolean
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data: req } = await admin
    .from("requests")
    .select("id, receiver_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.receiver_id !== userId) return false;

  const { error } = await admin.from("check_logs").upsert(
    {
      request_id: requestId,
      log_date: date,
      status: done ? "done" : "pending",
      done_at: done ? new Date().toISOString() : null,
    },
    { onConflict: "request_id,log_date" }
  );
  return !error;
}

// ===== 요청 하는 사람(니가 할일) 관점 =====
export type RequesterGroup = {
  receiverPhone: string;
  receiverNickname: string;
  registered: boolean; // 대상자가 가입되어 있는지
  items: {
    id: string;
    title: string;
    scheduleTime: string;
    daysOfWeek: number[];
    enabled: boolean;
    todayStatus: CheckStatus;
  }[];
};

export async function getRequesterGroups(userId: string, date: string): Promise<RequesterGroup[]> {
  const admin = getSupabaseAdmin();

  const { data: reqs } = await admin
    .from("requests")
    .select("*")
    .eq("requester_id", userId)
    .order("receiver_phone")
    .order("schedule_time");

  const list = (reqs || []) as RequestRow[];
  if (list.length === 0) return [];

  const requestIds = list.map((r) => r.id);
  const phones = [...new Set(list.map((r) => r.receiver_phone))];

  const [{ data: logs }, { data: profs }] = await Promise.all([
    admin.from("check_logs").select("request_id, status").in("request_id", requestIds).eq("log_date", date),
    admin.from("profiles").select("nickname, phone").in("phone", phones),
  ]);

  const statusByReq = new Map((logs || []).map((l) => [l.request_id, l.status as CheckStatus]));
  const nickByPhone = new Map((profs || []).map((p) => [p.phone, p.nickname]));

  const groups = new Map<string, RequesterGroup>();
  for (const r of list) {
    let g = groups.get(r.receiver_phone);
    if (!g) {
      g = {
        receiverPhone: r.receiver_phone,
        receiverNickname: nickByPhone.get(r.receiver_phone) || "(미가입)",
        registered: nickByPhone.has(r.receiver_phone),
        items: [],
      };
      groups.set(r.receiver_phone, g);
    }
    g.items.push({
      id: r.id,
      title: r.title,
      scheduleTime: r.schedule_time,
      daysOfWeek: r.days_of_week,
      enabled: r.enabled,
      todayStatus: statusByReq.get(r.id) || "pending",
    });
  }
  return [...groups.values()];
}

export async function createRequest(input: {
  requesterId: string;
  receiverPhone: string;
  title: string;
  scheduleTime: string;
  daysOfWeek?: number[];
}): Promise<{ ok: boolean; error?: string }> {
  const admin = getSupabaseAdmin();

  // 대상자가 이미 가입돼 있으면 receiver_id 연결
  const { data: receiver } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", input.receiverPhone)
    .maybeSingle();

  const { error } = await admin.from("requests").insert({
    requester_id: input.requesterId,
    receiver_id: receiver?.id ?? null,
    receiver_phone: input.receiverPhone,
    title: input.title,
    schedule_time: input.scheduleTime,
    days_of_week: input.daysOfWeek ?? [],
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// 요청 수정(켜기/끄기, 내용/시간). 요청자 본인만 가능.
export async function updateRequest(
  userId: string,
  requestId: string,
  patch: Partial<Pick<RequestRow, "enabled" | "title" | "schedule_time" | "days_of_week">>
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("requests")
    .update(patch)
    .eq("id", requestId)
    .eq("requester_id", userId)
    .select("id");
  return !error && !!data && data.length > 0;
}

export async function deleteRequest(userId: string, requestId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("requests")
    .delete()
    .eq("id", requestId)
    .eq("requester_id", userId)
    .select("id");
  return !error && !!data && data.length > 0;
}
