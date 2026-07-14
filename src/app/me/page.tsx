import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getReceiverItems } from "@/lib/data";
import { todayKST, addDays, dateLabel, nowHHMMKST } from "@/lib/time";
import AppHeader from "@/components/AppHeader";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import CheckItem from "./CheckItem";
import AlarmSound from "./AlarmSound";

export const dynamic = "force-dynamic";

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = todayKST();
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;

  const items = await getReceiverItems(user.id, date);
  const doneCount = items.filter((i) => i.status === "done").length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  // 오늘 화면에서, 예정 시각이 지났는데 아직 확인 안 한 항목이 있으면 알람음을 반복.
  const nowHHMM = nowHHMMKST();
  const hasDuePending =
    date === today &&
    items.some((i) => i.status === "pending" && i.scheduleTime <= nowHHMM);

  return (
    <>
      <AppHeader title="내가 할일" back="/home" />

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 pb-3.5 pt-1.5">
        <Link
          href={`/me?date=${addDays(date, -1)}`}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border text-muted active:bg-background"
        >
          <ChevronLeft size={16} />
        </Link>
        <div className="text-center">
          <div className="font-bold">{dateLabel(date, today)}</div>
          <div className="mt-px text-xs font-medium text-faint">{date}</div>
        </div>
        <Link
          href={`/me?date=${addDays(date, 1)}`}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border text-muted active:bg-background"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      <main className="flex-1 px-4 pb-5 pt-[18px]">
        <AlarmSound active={hasDuePending} />
        {items.length > 0 && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13.5px] font-medium text-muted">
                {items.length}개 중 <b className="font-bold text-leaf">{doneCount}개</b> 완료
              </p>
              <span className="text-[13px] font-semibold text-faint">{pct}%</span>
            </div>
            <div className="mb-[18px] h-1.5 overflow-hidden rounded-full bg-track">
              <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${pct}%` }} />
            </div>
          </>
        )}

        {items.length === 0 ? (
          <div className="mt-16 text-center text-muted">
            <p>이 날짜엔 확인할 내용이 없어요.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {items.map((it) => (
              <CheckItem key={it.requestId} item={it} date={date} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
