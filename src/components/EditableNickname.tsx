"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// 별명을 클릭하면 입력창으로 바뀌고, 확인하면 저장한다.
export default function EditableNickname({ initial }: { initial: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setValue(name);
    setEditing(true);
  }

  async function save() {
    const next = value.trim();
    if (!next || next === name) {
      setEditing(false);
      setValue(name);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: next }),
      });
      const data = await res.json();
      if (data.ok) {
        setName(data.nickname);
        setEditing(false);
        router.refresh();
      } else {
        alert(data.error || "변경에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setEditing(false);
    setValue(name);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          maxLength={20}
          disabled={saving}
          className="w-[8.5rem] rounded-[12px] border border-carrot bg-card px-3 py-1 text-[22px] font-extrabold tracking-tight outline-none"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-carrot px-3 py-1.5 text-sm font-bold text-white active:bg-carrot-dark disabled:opacity-50"
        >
          확인
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted active:bg-background"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1.5 text-left"
      aria-label="별명 수정"
    >
      <span className="text-[26px] font-extrabold tracking-tight">{name}님</span>
      <span className="text-[13px] font-medium text-faint underline decoration-faint/40 group-active:text-carrot">
        수정
      </span>
    </button>
  );
}
