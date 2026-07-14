import { ImageResponse } from "next/og";

// 카카오톡/소셜 공유 미리보기용 대표 이미지 (1200x630).
export const alt = "했니? — 정해진 시간에 물어보고, 했는지 확인해요";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// 빌드 시 미리 렌더하지 않고 요청 시 생성 (폰트 fetch를 빌드에서 하지 않도록)
export const dynamic = "force-dynamic";

// 한글 렌더링용 Pretendard(서브셋 woff) — Satori 호환 포맷
const FONT_URL =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff-subset/Pretendard-Bold.subset.woff";

export default async function Image() {
  const fontData = await fetch(FONT_URL).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "linear-gradient(135deg, #ff7a2f 0%, #ea5a24 100%)",
          fontFamily: "Pretendard",
        }}
      >
        {/* 흰 라운드 사각형 + 주황 체크마크 (앱 로고) */}
        <div
          style={{
            display: "flex",
            width: 176,
            height: 176,
            borderRadius: 44,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 50,
              borderLeft: "20px solid #ea5a24",
              borderBottom: "20px solid #ea5a24",
              transform: "rotate(-45deg)",
              marginTop: -16,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 108, fontWeight: 700, color: "#ffffff", letterSpacing: -2 }}>
            했니?
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
            정해진 시간에 물어보고, 했는지 확인해요
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Pretendard", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
