/* 라인 아이콘 세트 — stroke: currentColor, 부모 색상 상속 */
type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  className,
});

export function Check({ size = 20, className, strokeWidth = 2.6 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 12.5l4.2 4.2L19 6.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeft({ size = 18, className, strokeWidth = 2.2 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M15 4l-7 8 7 8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ size = 18, className, strokeWidth = 2.2 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 4l7 8-7 8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus({ size = 16, className, strokeWidth = 2.6 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function Clock({ size = 16, className, strokeWidth = 1.8 }: P) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M12 8v4.3l2.8 1.7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function Bell({ size = 18, className, strokeWidth = 1.8 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9.5 20a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/* 내가 할일 — 받은 요청(inbox) */
export function Inbox({ size = 24, className, strokeWidth = 1.8 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 13l2.5-7h13L21 13v5H3z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M3 13h4.5l1.2 2h6.6l1.2-2H21" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

/* 니가 할일 — 보내는 요청(send) */
export function Send({ size = 23, className, strokeWidth = 1.8 }: P) {
  return (
    <svg {...base(size, className)}>
      <path d="M21 3L10 14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3l-7 18-4-8-8-4 19-6z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
