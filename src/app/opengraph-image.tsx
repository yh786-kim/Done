import { ImageResponse } from "next/og";

// 카카오톡/소셜 공유 미리보기용 대표 이미지 (1200x630).
// 한글 폰트 의존성을 피하려고 이미지엔 텍스트 없이 브랜드 도형만 넣는다.
// (제목 "했니?"는 og:title 텍스트로 카카오가 렌더링)
export const alt = "했니?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff7a2f 0%, #ea5a24 100%)",
        }}
      >
        {/* 흰 라운드 사각형 + 주황 체크마크 (앱 로고 느낌) */}
        <div
          style={{
            display: "flex",
            width: 300,
            height: 300,
            borderRadius: 72,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 150,
              height: 84,
              borderLeft: "34px solid #ea5a24",
              borderBottom: "34px solid #ea5a24",
              transform: "rotate(-45deg)",
              marginTop: -28,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
