// Asia/Seoul(KST, UTC+9) 기준 시간 유틸. 서버 타임존과 무관하게 동작하도록 오프셋으로 계산.
const KST_OFFSET_MIN = 9 * 60;

function kstDate(now: Date = new Date()): Date {
  // now(UTC) + 9h → KST 시각을 UTC 필드에 담은 Date
  return new Date(now.getTime() + KST_OFFSET_MIN * 60 * 1000);
}

// 'YYYY-MM-DD' (KST)
export function todayKST(now: Date = new Date()): string {
  const d = kstDate(now);
  return d.toISOString().slice(0, 10);
}

// 'HH:MM' (KST)
export function nowHHMMKST(now: Date = new Date()): string {
  const d = kstDate(now);
  return d.toISOString().slice(11, 16);
}

// 0(일)~6(토) (KST)
export function dayOfWeekKST(dateStr: string): number {
  // dateStr('YYYY-MM-DD')의 요일. 정오 UTC로 만들어 경계 문제 회피.
  return new Date(dateStr + "T12:00:00Z").getUTCDay();
}

// 날짜 문자열 더하기
export function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// 사람이 읽는 날짜 라벨
export function dateLabel(dateStr: string, today: string): string {
  if (dateStr === today) return "오늘";
  if (dateStr === addDays(today, -1)) return "어제";
  if (dateStr === addDays(today, 1)) return "내일";
  const d = new Date(dateStr + "T12:00:00Z");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${days[d.getUTCDay()]})`;
}

// 요청이 특정 날짜에 활성인지.
// - 반복 요일이 지정돼 있으면(days_of_week 비어있지 않음) 해당 요일에만 활성
// - 반복 없음(비어있음)이면 '오늘 하루만' → 만든 날(KST)에만 활성
export function isActiveOnDate(daysOfWeek: number[], createdAt: string, dateStr: string): boolean {
  if (daysOfWeek && daysOfWeek.length > 0) return daysOfWeek.includes(dayOfWeekKST(dateStr));
  return todayKST(new Date(createdAt)) === dateStr;
}
