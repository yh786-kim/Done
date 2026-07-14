"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReceiverItem } from "@/lib/data";
import { Check } from "@/components/icons";

export default function CheckItem({ item, date }: { item: ReceiverItem; date: string }) {
  const router = useRouter();
  const [done, setDone] = useState(item.status === "done");
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !done;
    setDone(next); // 낙관적 업데이트
    setBusy(true);
    try {
      const res = await fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: item.requestId, date, done: next }),
      });
      if (!res.ok) {
        setDone(!next); // 롤백
      } else {
        router.refresh();
      }
    } catch {
      setDone(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li>
      <button
        onClick={toggle}
        disabled={busy}
        className={`flex w-full items-center gap-3 rounded-[18px] border p-4 text-left transition-colors ${
          done ? "border-leaf/30 bg-leaf-tint" : "border-border bg-card"
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            done ? "bg-leaf text-white" : "border-2 border-track text-transparent"
          }`}
        >
          {done && <Check size={15} strokeWidth={2.8} />}
        </span>
        <span className="flex-1">
          <span
            className={`block text-[15.5px] font-semibold ${
              done ? "text-leaf-dark line-through decoration-leaf-dark/40" : ""
            }`}
          >
            {item.title}
          </span>
          <span className={`mt-0.5 block text-xs font-medium ${done ? "text-leaf/70" : "text-faint"}`}>
            {item.scheduleTime} · {item.requesterNickname}님 요청
          </span>
        </span>
        <span className={`text-[13.5px] font-bold ${done ? "text-leaf" : "text-carrot"}`}>
          {done ? "완료" : "했어요?"}
        </span>
      </button>
    </li>
  );
}
