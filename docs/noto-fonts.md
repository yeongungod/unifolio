# Noto Sans KR 자체 호스팅 시안 (2026-10-18)

`redesign-261018-noto-codex`의 독립 시안이다. 기준은 공개본 `a99ba75`다.

- 출처: [Google Fonts CSS API](https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400..700&display=swap), Chrome 130 User-Agent로 받은 v40 배포본.
- 원본: [google/fonts Noto Sans KR](https://github.com/google/fonts/tree/main/ofl/notosanskr), Version 2.004-H2, TrueType 기반 가변 WOFF2.
- `public/fonts/noto-sans-kr/`에 Google이 제공한 124개 파일을 바이트 그대로 보관한다. 전체 3,507,740 bytes. 원격 폰트 요청은 없다.
- 대응 관계·SHA-256은 `noto-font-manifest.json`, 라이선스·저작권 고지는 `public/fonts/noto-sans-kr/OFL.txt`에 있다.
- `src/styles/fonts-noto.css`의 `unicode-range`를 보존한다. CSS의 굵기 범위는 실제 사용하는 `400 700`이며 요소별 400·500·600·700을 명시한다. 내부 기본 인스턴스 이름 Thin은 현재 CSS 굵기와 별개다.
- `font-display: swap`. 전체 한글 음절 11,172자를 지원한다. 특정 작품명에 맞춘 문자 삭제를 하지 않아 관리자 게시 시 새로운 제목에도 대응한다.
- `type-noto.css`는 이 브랜치의 토큰 덮어쓰기다. 생성 파일 `tokens.css` 및 G:의 DESIGN.md는 수정하지 않는다. 승인 후 보고서의 제안 값을 정본에 반영한다.
- Windows 맑은고딕 폴백: 한글 폭은 92%, 라틴은 Regular 99.3%·Bold 100%로 나눈다. 세로 메트릭도 보정한다. 해당 로컬 글꼴이 없는 운영체제는 기존 시스템 스택으로 이어진다.
- 기존 SUITE 파일은 보존하지만 CSS에서 요청하지 않는다. 의존성 추가, Astro 업그레이드, 배포 설정 변경은 없다.

전체 페이지 전후 이미지·폰트 전송량·줄바꿈·CLS와 DESIGN.md 제안 값은 작업 지시서의 G: 산출물 폴더 `18_Noto전환/codex_구현/보고서.md`에 정리한다.
