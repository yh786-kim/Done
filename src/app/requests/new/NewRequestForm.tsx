"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneInput, formatPhone, normalizePhone } from "@/lib/phone";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

type Receiver = { phone: string; nickname: string | null };

export default function NewRequestForm({
  receivers = [],
  titles = [],
}: {
  receivers?: Receiver[];
  titles?: string[];
}) {
  const router = useRouter();
  const [receiverPhone, setReceiverPhone] = useState("");
  const [title, setTitle] = useState("");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [repeat, setRepeat] = useState(false); // 기본: 오늘 하루만
  const [days, setDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (repeat && days.length === 0) {
      setError("반복할 요일을 하나 이상 선택해주세요.");
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
          // 반복 켜짐 → 선택 요일, 꺼짐 → 빈 배열(오늘 하루만)
          daysOfWeek: repeat ? days : [],
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

  const chipCls = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
      active ? "border-carrot bg-carrot text-white" : "border-border bg-card text-muted"
    }`;

  return (
    <form onSubmit={submit} className="space-y-[22px]">
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">누구에게</label>
        {receivers.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {receivers.map((r) => {
              const active = normalizePhone(receiverPhone) === r.phone;
              return (
                <button
                  key={r.phone}
                  type="button"
                  onClick={() => setReceiverPhone(formatPhone(r.phone))}
                  className={chipCls(active)}
                >
                  {r.nickname || formatPhone(r.phone)}
                </button>
              );
            })}
          </div>
        )}
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
          {receivers.length > 0 ? "이전 대상에서 고르거나 새 번호를 입력하세요. " : ""}
          아직 가입 안 한 번호도 등록돼요. 가입하면 자동 연결됩니다.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">확인할 내용</label>
        {titles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {titles.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTitle(t)}
                className={chipCls(title === t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 양치했니?"
          maxLength={60}
          className={inputCls}
          required
        />
        {titles.length > 0 && (
          <p className="mt-2 text-xs font-medium text-faint">
            이전 내용에서 고르거나 새로 입력하세요.
          </p>
        )}
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
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-[13px] font-semibold text-muted">반복</label>
            <p className="mt-0.5 text-xs font-medium text-faint">
              {repeat ? "선택한 요일마다 반복해요" : "끄면 오늘 하루만 확인해요"}
            </p>
          </div>
          {/* 반복 켜기/끄기 토글 */}
          <button
            type="button"
            onClick={() => setRepeat((v) => !v)}
            aria-label="반복"
            className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors ${
              repeat ? "bg-carrot" : "bg-track"
            }`}
          >
            <span
              className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all ${
                repeat ? "left-[21px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>
        {repeat && (
          <div className="mt-3 flex gap-1.5">
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
