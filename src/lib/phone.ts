// 전화번호 정규화: 숫자만 남기고, 한국 번호를 010xxxxxxxx 형태로 통일.
export function normalizePhone(input: string): string {
  let d = (input || "").replace(/[^0-9]/g, "");
  // +82 10 ... → 010 ...
  if (d.startsWith("82")) d = "0" + d.slice(2);
  return d;
}

export function isValidPhone(input: string): boolean {
  const d = normalizePhone(input);
  // 한국 휴대폰: 010으로 시작하는 10~11자리
  return /^01[016789][0-9]{7,8}$/.test(d);
}

// 표시용: 010-1234-5678
export function formatPhone(input: string): string {
  const d = normalizePhone(input);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return input;
}

// 입력 중 실시간 포맷: 숫자만 입력해도 자동으로 하이픈(-)을 넣어준다.
// 예: "01012345678" → "010-1234-5678", 타이핑 중간값도 자연스럽게 처리.
export function formatPhoneInput(value: string): string {
  const d = (value || "").replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  // 10자리(또는 8~10 입력 중): 010-123-4567
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}
