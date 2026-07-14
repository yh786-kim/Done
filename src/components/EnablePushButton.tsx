"use client";
/* 마운트 시 브라우저 알림 지원/권한을 1회 감지하는 정상 패턴 */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Bell } from "@/components/icons";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function EnablePushButton() {
  const [state, setState] = useState<"unknown" | "unsupported" | "granted" | "prompt" | "denied">(
    "unknown"
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState(
      Notification.permission === "granted"
        ? "granted"
        : Notification.permission === "denied"
          ? "denied"
          : "prompt"
    );
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "prompt");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) {
        alert("서버에 VAPID 키가 설정되지 않았습니다.");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setState("granted");
    } catch (e) {
      console.error(e);
      alert("알림 설정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "unsupported")
    return (
      <p className="text-center text-xs font-medium text-faint">
        이 브라우저는 푸시 알림을 지원하지 않아요. 홈 화면에 앱을 설치하면 알림을 받을 수 있어요.
      </p>
    );

  if (state === "granted")
    return (
      <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-leaf">
        <Bell size={14} /> 알림이 켜져 있어요.
      </p>
    );

  if (state === "denied")
    return (
      <p className="text-center text-xs font-medium text-faint">
        알림이 차단돼 있어요. 브라우저 설정에서 이 사이트의 알림을 허용해주세요.
      </p>
    );

  return (
    <button
      onClick={enable}
      disabled={busy}
      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-border bg-card text-[14.5px] font-semibold text-muted active:bg-background disabled:opacity-50"
    >
      <Bell size={18} />
      {busy ? "설정 중..." : "알림 받기 켜기"}
    </button>
  );
}
