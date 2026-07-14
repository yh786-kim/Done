"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    const data = await res.json();
    router.push(data.redirect || "/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="h-[34px] rounded-full border border-border bg-card px-3.5 text-[13px] font-semibold text-muted active:bg-background"
    >
      로그아웃
    </button>
  );
}
