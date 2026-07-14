"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneInput } from "@/lib/phone";

const INPUT_CLS =
  "h-[54px] w-full rounded-[14px] border border-border bg-card px-4 text-base font-medium outline-none transition-colors focus:border-carrot";
const BTN_CLS =
  "h-[54px] w-full rounded-[14px] bg-carrot text-base font-bold text-white shadow-lg shadow-carrot/25 transition-colors active:bg-carrot-dark disabled:opacity-50";

export default function LoginForm({
  prefillPhone = "",
  canQuick = false,
}: {
  prefillPhone?: string;
  canQuick?: boolean;
}) {
  const router = useRouter();
  const [quickMode, setQuickMode] = useState(canQuick);
  const [phone, setPhone] = useState(prefillPhone);
  const [nickname, setNickname] = useState("");
  const [showNickname, setShowNickname] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [sent, setSent] = useState(false);

  // '시작' — 링크 없이 기억된 번호로 바로 로그인
  async function start() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/quick-login", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        router.push(data.redirect || "/home");
        router.refresh();
        return;
      }
      // 기억 정보가 만료된 경우 → 일반 로그인으로 전환
      setError(data.error || "다시 로그인해주세요.");
      setQuickMode(false);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // 일반 로그인/가입 — 링크 발송
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, nickname }),
      });
      const data = await res.json();
      if (data.needNickname) {
        setShowNickname(true);
        setError("처음 오셨네요! 사용할 별명을 정해주세요.");
        return;
      }
      if (!data.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }
      if (data.devLink) setDevLink(data.devLink);
      else setSent(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (devLink) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="mb-3 text-sm text-muted">
          개발 모드입니다. 아래 버튼을 누르면 로그인돼요.
          <br />
          (실제 서비스에서는 문자로 링크가 발송됩니다)
        </p>
        <a href={devLink} className={`block text-center leading-[54px] ${BTN_CLS}`}>
          인증 링크 열기 →
        </a>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted">
          <b className="text-foreground">{phone}</b> 로<br />
          로그인 링크를 보냈어요. 문자를 확인해주세요.
        </p>
      </div>
    );
  }

  // ===== '시작' 모드: 번호 자동 입력 + 원탭 로그인 =====
  if (quickMode) {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-muted">휴대폰 번호</label>
          <input
            type="tel"
            value={phone}
            readOnly
            className={`${INPUT_CLS} text-foreground`}
          />
        </div>

        {error && <p className="text-sm text-carrot-dark">{error}</p>}

        <button onClick={start} disabled={loading} className={BTN_CLS}>
          {loading ? "시작하는 중..." : "시작"}
        </button>

        <button
          type="button"
          onClick={() => {
            setQuickMode(false);
            setPhone("");
            setError("");
          }}
          className="block w-full text-center text-[12.5px] font-medium text-faint underline"
        >
          다른 번호로 로그인
        </button>
      </div>
    );
  }

  // ===== 일반 모드: 번호 입력 → 링크 발송 =====
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-2 block text-[13px] font-semibold text-muted">휴대폰 번호</label>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          maxLength={13}
          placeholder="010-1234-5678"
          className={INPUT_CLS}
          required
        />
      </div>

      {showNickname && (
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-muted">별명</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 엄마, 홍길동"
            maxLength={20}
            className={INPUT_CLS}
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-carrot-dark">{error}</p>}

      <button type="submit" disabled={loading} className={BTN_CLS}>
        {loading ? "처리 중..." : "로그인 링크 받기"}
      </button>
      <p className="text-center text-[12.5px] font-medium leading-relaxed text-faint">
        비밀번호가 없어요. 번호로 로그인 링크를 보내드립니다.
      </p>
    </form>
  );
}
