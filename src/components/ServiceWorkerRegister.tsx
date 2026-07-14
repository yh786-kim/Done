"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((e) => {
        console.warn("서비스워커 등록 실패:", e);
      });
    }
  }, []);
  return null;
}
