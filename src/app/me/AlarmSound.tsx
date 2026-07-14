"use client";
/* 알람 자동 시작/중지를 effect에서 제어하는 정상 패턴 */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Bell } from "@/components/icons";

// 앱이 열려 있는 동안, 확인하지 않은 '예정 지난' 항목이 있으면 알람음을 주기적으로 반복 재생.
// 브라우저 자동재생 정책상 사용자의 탭이 한 번 필요할 수 있어, 막히면 켜기 버튼을 보여준다.
export default function AlarmSound({ active }: { active: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [needTap, setNeedTap] = useState(false);

  function beep() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    // "삐-삐-삐" 3연음
    [0, 0.28, 0.56].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.24);
    });
    if (navigator.vibrate) navigator.vibrate([300, 120, 300]);
  }

  function start() {
    if (timerRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current) ctxRef.current = new AC();
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      beep();
      timerRef.current = setInterval(beep, 3000); // 3초마다 반복
      setNeedTap(false);
    } catch {
      setNeedTap(true);
    }
  }

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }
    // 자동 시작 시도. 자동재생이 막히면(state suspended 유지) 켜기 버튼 노출.
    start();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") setNeedTap(true);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active || !needTap) return null;

  return (
    <button
      onClick={start}
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px] bg-carrot py-3 text-sm font-bold text-white shadow-lg shadow-carrot/25"
    >
      <Bell size={16} /> 알람 소리 켜기 (확인 전까지 울려요)
    </button>
  );
}
