"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneInput } from "@/lib/phone";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function NewRequestForm() {
  const router = useRouter();
  const [receiverPhone, setReceiverPhone] = useState("");
  const [title, setTitle] = useState("");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [everyday, setEveryday] = useState(true);
  const [days, setDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!everyday && days.length === 0) {
      setError("요일을 하나 이상 선택하거나 '매일'을 켜주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverPhone,
          title,
          scheduleTime,
          daysOfWeek: everyday ? [] : days,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "등록에 실패했습니다.");
        return;
      }
      router.push("/requests");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "h-[52px] w-full rounded-[14px] border border-border bg-card px-4 text-[15.5px] font-medium outline-none transition-colors focus:border-carrot";

  return (
    <form onSubmit={submit} className="space-y-[22px]">
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">누구에게 · 휴대폰 번호</label>
        <input
          type="tel"
          inputMode="numeric"
          value={receiverPhone}
          onChange={(e) => setReceiverPhone(formatPhoneInput(e.target.value))}
          placeholder="010-1234-5678"
          maxLength={13}
          className={inputCls}
          required
        />
        <p className="mt-2 text-xs font-medium leading-relaxed text-faint">
          아직 가입 안 한 번호도 등록돼요. 그 사람이 가입하면 자동 연결됩니다.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">확인할 내용</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 양치했니?"
          maxLength={60}
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">언제 물어볼까요</label>
        <input
          type="time"
          value={scheduleTime}
          onChange={(e) => setScheduleTime(e.target.value)}
          className={`${inputCls} font-semibold`}
          required
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[13px] font-semibold text-muted">반복</label>
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-muted">매일</span>
            <input
              type="checkbox"
              checked={everyday}
              onChange={(e) => setEveryday(e.target.checked)}
              className="h-5 w-5 accent-carrot"
            />
          </label>
        </div>
        {!everyday && (
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`h-[42px] flex-1 rounded-xl text-sm font-bold transition-colors ${
                  days.includes(d)
                    ? "bg-carrot text-white"
                    : "border border-border bg-card font-semibold text-faint"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-carrot-dark">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-[54px] w-full rounded-[14px] bg-carrot text-base font-bold text-white shadow-lg shadow-carrot/25 transition-colors active:bg-carrot-dark disabled:opacity-50"
      >
        {loading ? "등록 중..." : "요청 등록하기"}
      </button>
    </form>
  );
}
