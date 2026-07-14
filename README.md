# Done — 리디자인 적용 소스

`심플·깔끔·세련` 방향 + **다크 모드**를 실제 코드에 반영한 파일들입니다.
기존 리포의 같은 경로에 그대로 덮어쓰면 됩니다.

## 덮어쓸 파일
```
src/app/globals.css                    ← 팔레트 + 라이트/다크 토큰 + Pretendard
src/components/icons.tsx               ← (신규) 라인 아이콘 세트
src/components/AppHeader.tsx
src/components/LogoutButton.tsx
src/components/EnablePushButton.tsx
src/app/login/page.tsx
src/app/login/LoginForm.tsx
src/app/home/page.tsx
src/app/me/page.tsx
src/app/me/CheckItem.tsx
src/app/requests/page.tsx
src/app/requests/RequestItem.tsx
src/app/requests/new/page.tsx
src/app/requests/new/NewRequestForm.tsx
```
> `src/lib/*`, `src/app/api/*`, 스키마 등 **로직은 손대지 않았습니다.** UI/스타일만 교체.

## 핵심
- **디자인 토큰**: 색은 전부 CSS 변수(`--carrot`, `--leaf`, `--card`, `--border`, `--muted`, `--faint`, `--track` …)로 정의.
  Tailwind v4 `@theme inline`에 매핑돼 `bg-carrot`, `text-muted`, `bg-leaf-tint` 같은 유틸로 사용.
- **다크 모드**: `globals.css`의 `@media (prefers-color-scheme: dark)`에서 같은 변수만 재정의.
  컴포넌트는 한 벌이고, OS 다크 설정에 **자동으로** 따라갑니다. (별도 토글 불필요)
- **이모지 제거** → `icons.tsx`의 라인 아이콘으로 통일.
- **오렌지는 주요 액션에만, 초록은 완료 상태에만** 절제 사용.
- **Pretendard** 폰트 (globals.css에서 CDN import).

## 참고
- 다크에서 상태바 색을 맞추려면 `src/app/layout.tsx`의 `viewport.themeColor`를
  라이트/다크 배열로 바꿔도 좋습니다:
  ```ts
  export const viewport: Viewport = {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
      { media: "(prefers-color-scheme: dark)",  color: "#121210" },
    ],
    // ...나머지 동일
  };
  ```
- 폰트를 번들로 넣고 싶으면 `pretendard` npm 패키지로 교체 가능 (CDN import 대신).
