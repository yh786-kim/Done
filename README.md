# 이번 변경분 (v2 — 손 이미지 크게)

손 그림을 키워 여백을 줄인 v2를 로고·런처 아이콘에 반영했습니다.
아래 파일들을 기존 리포의 같은 경로에 덮어쓰면 됩니다.

```
public/manifest.json                    ← 아이콘 항목 PNG + theme/배경색 통일
public/icons/hand-white.png             ← 흰색 손 이미지 (로그인 로고가 사용)
public/icons/icon-192.png               ← 런처 아이콘 192 (손 크게)
public/icons/icon-512.png               ← 런처 아이콘 512, purpose any (손 크게)
public/icons/icon-maskable-512.png      ← 안드로이드 maskable (세이프존 반영)
src/app/login/page.tsx                  ← 로고 손 이미지 크기 확대
src/components/icons.tsx                 ← 임시 PointHand 제거 (원상 복구)
```

- 기존 `public/icons/icon.svg`, `icon-maskable.svg` 는 삭제하세요.
- 원본 이미지가 상용 소스(워터마크)로 보입니다. 배포 전 라이선스를 확인하세요.
