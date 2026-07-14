"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "@/components/icons";

type Item = {
  id: string;
  title: string;
  scheduleTime: string;
  daysOfWeek: number[];
  enabled: boolean;
  todayStatus: "pending" | "done";
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function daysText(days: number[]): string {
  if (!days || days.length === 0) return "매일";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join("·");
}

export default function RequestItem({ item }: { item: Item }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(item.enabled);
  const [busy, setBusy] = useState(false);

  async function toggleEnabled() {
    if (busy) return;
    const next = !enabled;
    setEnabled(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/requests/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) setEnabled(!next);
      else router.refresh();
    } catch {
      setEnabled(!next);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`"${item.title}" 요청을 삭제할까요?`)) return;
    setBusy(true);
    const res = await fetch(`/api/requests/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setBusy(false);
  }

  return (
    <li
      className={`rounded-[18px] border border-border bg-card p-4 transition-opacity ${
        enabled ? "" : "opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[15.5px] font-semibold">{item.title}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-faint">
            <Clock size={13} />
            {item.scheduleTime} · {daysText(item.daysOfWeek)}
          </div>
          <div className="mt-2.5">
            {item.todayStatus === "done" ? (
              <span className="rounded-full bg-leaf-tint px-2.5 py-1 text-xs font-bold text-leaf-dark">
                오늘 완료 ✓
              </span>
            ) : (
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">
                {enabled ? "오늘 아직" : "꺼짐"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* 켜기/끄기 토글 */}
          <button
            onClick={toggleEnabled}
            disabled={busy}
            aria-label="켜기/끄기"
            className={`relative h-[26px] w-11 rounded-full transition-colors ${
              enabled ? "bg-carrot" : "bg-track"
            }`}
          >
            <span
              className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all ${
                enabled ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="text-xs font-medium text-faint active:text-carrot-dark"
          >
            삭제
          </button>
        </div>
      </div>
    </li>
  );
}
