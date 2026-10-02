---
name: uniStudio
description: 소리의 호흡까지 — 소리까지 책임지는 편집
colors:
  ink: "#141210"
  ink-2: "#26231F"
  paper: "#FBF9F6"
  white: "#FFFFFF"
  accent: "#9CC3D5"
  muted: "#8A837C"
  muted-text: "#605C56"
  rule: "#E3DED8"
  rule-on-ink: "rgba(251, 249, 246, 0.12)"
typography:
  a4-display:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "34pt"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.035em"
  a4-headline:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "15pt"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  a4-title:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "11pt"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  a4-lead:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "10.5pt"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "-0.02em"
  a4-body:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "9.5pt"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "-0.02em"
  a4-table:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "9pt"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  a4-note:
    fontFamily: "SUITE, Malgun Gothic, sans-serif"
    fontSize: "8pt"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  slide-display:
    fontFamily: "SUITE"
    fontSize: "84px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  slide-headline:
    fontFamily: "SUITE"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  slide-stat:
    fontFamily: "SUITE"
    fontSize: "120px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  slide-title:
    fontFamily: "SUITE"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  slide-body:
    fontFamily: "SUITE"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.02em"
  slide-meta:
    fontFamily: "SUITE"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  web-display:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "clamp(32px, 6vw, 56px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  web-headline:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "clamp(22px, 3.5vw, 30px)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  web-title:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  web-lead:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  web-body:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  web-small:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  web-caption:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0"
  web-label:
    fontFamily: "SUITE, Pretendard, Malgun Gothic, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  none: "0"
  sm: "4px"
  lg: "12px"
  slide-sm: "6px"
  slide-lg: "18px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "18": "72px"
  a4-margin-top: "15mm"
  a4-margin-x: "18mm"
  a4-margin-bottom: "20mm"
  a4-folio-bottom: "10mm"
  a4-gutter: "6mm"
  slide-margin-x: "96px"
  slide-band: "15px"
  slide-gutter: "36px"
  web-max: "1080px"
  web-gutter: "20px"
components:
  button-web:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    typography: "{typography.web-title}"
    padding: "12px 20px"
  card-web:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-slide:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slide-lg}"
    padding: "36px"
  chip-slide:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slide-sm}"
    typography: "{typography.slide-meta}"
    padding: "6px 18px"
  table-head-a4:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    typography: "{typography.a4-table}"
  callout-a4:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4mm 5mm"
---

# Design System: uniStudio

> 원본(정본)은 이 파일이다. 맨 위 값이 바뀌면 `build_tokens.py`가 `tokens.css`(웹·A4 HTML)와 `tokens.py`(PPTX)를 다시 만든다. 값을 다른 곳에 손으로 옮겨 적지 않는다. 브랜드 원본(로고·색 유래)은 `..\build.py`와 `..\README.md`. 제품 맥락은 `PRODUCT.md`.

## Overview

**Creative North Star: "호흡을 고르는 편집실"**

좋은 믹스는 소리를 꽉 채우지 않고 숨 쉴 자리를 남긴다. 우니스튜디오의 지면도 그렇다. 여백이 숨이고, 먹색 글자가 박자이며, 아쿠아마린은 파형의 한 바처럼 **한 화면에 한두 번만** 들어온다. 분위기는 **정밀하고 대담하게**. 정렬·숫자·간격은 정확히 맞추고, 제목은 크고 단단하게 둔다. 꾸밈으로 채우지 않는다.

같은 규칙 아래 **강도가 두 단계**다. **절제** 단계(기관 서류: 사업계획서·제안서·견적서)는 흰 종이, 표와 숫자 위주, 모서리 0, 장식은 아쿠아 면 몇 곳뿐이다. 흑백 복사돼도 정보가 남아야 한다. **표현** 단계(회사소개서·웹사이트)는 먹색 전면, 큰 숫자, 둥근 카드, 파형 마크를 앞에 둔다. 작업물(영상·수상 이력)이 주인공이다.

**Key Characteristics:**
- 먹색·종이색 두 바탕, 아쿠아마린 하나의 강조. 다른 강조색 없음
- SUITE 한 서체, 굵기 400·500·600·700
- 그림자 없음. 깊이는 면 색 차이(ink → ink-2, white → paper)로만
- 4의 배수 간격, 모서리 0·4·12 세 단계
- 1인 스튜디오를 부풀리지 않는다: 얼굴 사진·가짜 팀·과장 수치 없음

## Colors

먹색과 따뜻한 종이색 위에 서늘한 아쿠아마린 하나가 숨처럼 들어오는 팔레트.

### Primary
- **Aquamarine Breath** (#9CC3D5, Pantone 14-4313 TPG): 유일한 강조색. **면적이 있는 곳에만 쓴다**: 표지 띠, 절 제목 아래 짧은 막대, 카드 윗변(4px 이상), 표 머리 행, 슬라이드 오른쪽 띠, 파형 마크의 2번째 바. 먹색 바탕 위에서는 라벨 글자로도 쓴다(대비 9.95:1).

### Neutral
- **Studio Ink** (#141210): 밝은 바탕의 본문·제목 글자, 웹 전체 바탕, 슬라이드 먹색 전면 장.
- **Ink Panel** (#26231F): 먹색 바탕 위의 카드·패널 면.
- **Warm Paper** (#FBF9F6): 웹 본문 글자, 슬라이드 바탕, A4 표지·안내 상자 바탕.
- **White** (#FFFFFF): A4 본문 쪽 바탕(인쇄 기준), 슬라이드 카드 면.
- **Graphite Text** (#605C56): 밝은 바탕의 작은 보조 글자(주석·캡션·쪽번호·메타). paper 위 대비 6.32:1, 흰색 위 6.64:1.
- **Stone** (#8A837C): 장식용 회색: 큰 글자, 아이콘, 먹색 바탕 위 보조 글자. **밝은 바탕의 작은 글자에는 쓰지 않는다**(대비 3.7:1 미달).
- **Hairline** (#E3DED8): 밝은 바탕의 괘선·테두리.
- **Hairline on Ink** (rgba(251,249,246,0.12)): 먹색 바탕의 괘선·테두리.

### Named Rules
**The One Breath Rule.** 아쿠아마린은 한 화면(한 쪽·한 장·한 뷰포트)에서 두 곳 이하. 드물어야 숨처럼 보인다.

**The No Thin Aqua Rule.** 밝은 바탕에서 아쿠아마린 글자, 3px(인쇄 0.8mm) 미만 선은 금지. 대비 1.8:1이라 보이지 않는다.

**The Ink Bar Rule.** 아쿠아마린 면 위의 파형 마크는 강조 바까지 전부 먹색. 안 그러면 2번째 바가 배경에 묻혀 3바 마크가 된다.

## Typography

**Display Font:** SUITE (대체: Pretendard, Malgun Gothic)
**Body Font:** SUITE
**Label/Mono Font:** 없음. 숫자도 SUITE

**Character:** 한 서체 하나로 굵기 대비만 쓴다. 제목은 700에 자간을 좁혀 단단하게, 본문은 넉넉한 줄간격으로 숨 쉬게 한다.

판형마다 크기는 다르지만 비율(제목 : 본문 ≈ 3.5 : 1, 큰 숫자는 제목의 1.4배)은 같다.

### Hierarchy — A4 세로 (절제, pt)
- **Display** (700, 34pt, 1.16): 표지 제목.
- **Headline** (700, 15pt, 1.3): 절 제목. 번호 앞에 아쿠아 세로 막대 0.8mm × 0.8em (2026-10-03 사용자 선택).
- **Title** (600, 11pt, 1.4): 소제목.
- **Lead** (400, 10.5pt, 1.7): 절 첫 문단.
- **Body** (400, 9.5pt, 1.7): 본문. 한 줄 최대 약 45자.
- **Table** (400, 9pt, 1.5): 표.
- **Note** (400, 8pt, 1.5, Graphite Text): 주석·출처·머리글·쪽번호.

### Hierarchy — 16:9 슬라이드 (표현, FHD 1920×1080 px)
- **Display** (700, 84px, 1.2): 표지·마지막 장 제목.
- **Headline** (700, 60px, 1.3): 장 제목.
- **Stat** (700, 120px, 1.0): 큰 숫자.
- **Title** (700, 36px, 1.35): 카드 제목.
- **Body** (400, 30px, 1.55): 본문.
- **Meta** (400, 24px, 1.4): 칩·바닥글·쪽번호. **섹션 탭(「01 · 요약」)만 같은 크기에 Bold**로 둔다(Regular면 탭이 약해진다, 2026-10-03).
- PPTX에서는 굵기를 400·700 두 개만 쓴다(Regular/Bold로 매핑). px → pt 변환은 ×0.5(1920px = 13.333in = 960pt).
- 자간은 `tokens.py`의 `tracking_em` × 글자 px × 0.5 × 100 = PPTX `spc`(1/100pt) 값으로 넣는다.

### Hierarchy — 웹 (표현, 어두운 테마)
- **Display** (700, clamp(32px, 6vw, 56px), 1.15): h1.
- **Headline** (700, clamp(22px, 3.5vw, 30px), 1.3): h2.
- **Title** (600, 17px, 1.4): h3, 버튼.
- **Lead** (500, 18px, 1.6, Stone): 첫 화면 부제목.
- **Body** (500, 16px, 1.6): 본문. 어두운 바탕이라 한 단계 굵게.
- **Small** (500, 14px, 1.5): 메뉴·목록·필터 칩·버튼.
- **Caption** (500, 13px, 1.5): 바닥글·캡션.
- **Label** (600, 12px, +0.12em, 대문자): 섹션 라벨, 아쿠아마린 글자.

### Named Rules
**The One Family Rule.** SUITE 외 서체 금지. `브랜드\_fonts\su-*.ttf`는 SUIT Variable이라 SUITE가 아니다. SUITE ttf는 `unifolio\public\fonts\` 또는 `260923_사업계획서\fonts\`.

**The No Dash Rule.** SUITE엔 `—`·`–`·`−` 글리프가 없다. 쓰면 다른 서체로 떨어진다 → `:`·`·`·`-`로 쓴다.

## Layout

**A4 세로 (절제).** `@page { size: A4; margin: 0 }`, 안쪽 여백 위 15 / 좌우 18 / 아래 20mm, 쪽번호는 아래 10mm. 2단 그리드 간격 6mm, 통계 카드 3단 간격 4mm. 본문 쪽 바탕은 흰색, 표지만 paper.

**16:9 슬라이드 (표현).** 1920×1080 기준. 좌우 여백 96px, 오른쪽 끝 아쿠아 세로 띠 15px. 카드는 3단 또는 2단, 간격 36px. 로고는 2장부터 오른쪽 위 폭 204px.

**웹 (표현).** 최대 폭 1080px, 좌우 16px. 섹션 위아래 72px(모바일 48px). 그리드 간격 20px, 칸 최소 280px. 머리글 높이 60px.

**간격 리듬.** 화면은 4의 배수(4·8·12·16·24·32·48·72)만 쓴다. 인쇄는 mm 값(위 레이아웃 값)을 쓴다.

**바닥글.** A4 가운데 「우니스튜디오 · 문서명 · n / N」. 슬라이드는 왼쪽 아래 「uniStudio · 문서명」, **쪽번호 「n / N」은 오른쪽 아래**(2026-10-03 사용자 선택). 쪽번호에 0을 채우지 않는다(02 ✗ 2 ✓).

## Elevation & Depth

그림자를 쓰지 않는다. 깊이는 면 색의 단계로만 만든다: 웹은 ink 바탕 위 ink-2 카드, 슬라이드는 paper 바탕 위 white 카드 + Hairline 테두리, A4는 white 바탕 위 paper 안내 상자.

### Named Rules
**The Flat Studio Rule.** 그림자·광택·그라데이션 없음. 녹음실 벽처럼 평평한 면 위에 소리(내용)만 놓인다.

## Shapes

모서리는 0·4·12 세 단계(슬라이드는 FHD 배율로 0·6·18). **절제 단계(A4)는 전부 0**, 각진 표와 상자로 서류의 신뢰를 낸다. **표현 단계**는 버튼·칩 4(슬라이드 6), 카드 12(슬라이드 18). 아쿠아 사각 불릿(A4 1.8mm)은 모서리 0. 반복 모티프는 파형 4바: 강조 막대·띠의 비율을 파형 바에서 가져온다.

## Components

### Buttons (웹)
- **Shape:** 각진 듯 부드럽게 (4px)
- **Primary:** paper 면 + ink 글자, 600 14px(Small), 안쪽 12px 20px
- **Ghost:** 투명 면 + Hairline on Ink 1px 테두리 + paper 글자
- **Hover / Focus:** 면 색만 바뀐다. 포커스는 2px 아쿠아 외곽선(먹색 바탕이라 허용)

### Chips (슬라이드)
- **Style:** paper 면, ink 글자, 모서리 6px, Meta 24px

### Cards / Containers
- **Corner Style:** 웹 12px, 슬라이드 18px, A4 0
- **Background:** 웹 ink-2, 슬라이드 white, A4 paper
- **Shadow Strategy:** 없음 (Elevation 참조)
- **Border:** 슬라이드 Hairline 1px. 카드 윗변 아쿠아(웹 4px, 슬라이드 6px, A4 통계 카드 1mm)
- **Internal Padding:** 웹 24px, 슬라이드 36px, A4 4~5mm

### Accent Bar (시그니처)
파형의 한 바. 판형별로 모양이 다르다(2026-10-03 사용자 선택).
- 웹: 라벨 아래 56×4px.
- A4: 절 번호 앞 **세로 막대 0.8mm × 0.8em**. 제목 아래 가로 4mm 막대는 의도가 안 읽혀 교체.
- 슬라이드: 섹션 탭 밑줄 **탭 글자 폭 × 3px**. 고정 84×6은 글자와 안 맞아 짧아 보여 교체.

본문 폭 전체로 늘인 아쿠아 밑줄은 쓰지 않는다.

### Table (A4)
머리 행 아쿠아 면 + ink 600 글자, 행 구분 Hairline 1px, 합계 행 paper 면. 숫자는 오른쪽 정렬.

### Callout (A4)
paper 면 + 왼쪽 아쿠아 막대 1mm, 모서리 0.

### Filter Chip (웹)
- 투명 면 + Hairline on Ink 1px 테두리, 모서리 4px, Small 14px. 알약 모양(999px) 쓰지 않는다.

### Client Logo Strip (웹, 의도된 예외)
메인 「주요 클라이언트」 로고 띠는 계속 흐르는 애니메이션이다(2026-09-29 사용자 결정: 마우스를 올려도 멈추지 않고 키보드 포커스만 멈춤). impeccable `marquee` 경고는 알고 둔 예외로 본다. 로고 크기는 `clients.ts`의 `scale`로 잉크 면적 약 5,600px²에 맞춘다.

### Navigation (웹)
머리글 높이 60px, 흰색 락업 폭 142px(600px 이하는 마크만). 메뉴 14px 500, 현재 위치는 아쿠아 막대.

## Do's and Don'ts

### Do:
- **Do** 아쿠아마린은 면적(띠·막대·표 머리·카드 윗변 4px+, 인쇄 0.8mm+)으로만 쓰고 한 화면 두 곳 이하로.
- **Do** 밝은 바탕의 작은 보조 글자는 Graphite Text #605C56로.
- **Do** 기관 서류는 흰 바탕·모서리 0·표 중심으로. 흑백 복사에서도 읽히게 색만으로 구분하지 않는다.
- **Do** 슬라이드는 1920×1080 기준 좌표로 설계한다.
- **Do** 로고는 SVG(문서·웹), PPTX만 원본 SVG에서 2배 해상도로 뽑은 PNG. 락업 최소 폭 20mm/80px, 사방 여백 마크 높이의 절반.

### Don't:
- **Don't** 아쿠아마린 외 강조색을 쓰지 않는다(옛 주황 포함).
- **Don't** 밝은 바탕에 Stone #8A837C 작은 글자, 아쿠아 글자, 3px 미만 아쿠아 선을 쓰지 않는다.
- **Don't** 그림자·그라데이션·광택을 쓰지 않는다.
- **Don't** 대표 얼굴 사진, 가짜 팀 사진, 허락 안 된 클라이언트 로고(서울관광재단 등)를 쓰지 않는다.
- **Don't** SUITE 외 서체, `—`·`–`·`−` 기호를 쓰지 않는다.
- **Don't** 파형 마크를 밑변 정렬로 바꾸지 않는다(막대그래프로 읽힌다).
