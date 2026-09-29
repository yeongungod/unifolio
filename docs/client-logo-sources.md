# 클라이언트 로고 출처

## 09-29 회사소개서 로고 7곳 추가

회사소개서 `260926_회사소개서_v2/v3_assets/logos/README.md`의 수집 기록과 지정 자산을 사용했다. 아래 출처는 해당 README의 기록을 옮긴 것이며 이번 작업에서 다시 다운로드하지 않았다. 회사소개서 원본은 수정하지 않았다.

| 파일 | 기관 | 출처 | 웹 표시 처리 |
|---|---|---|---|
| snu_signature.png | 서울대학교 | [logofinder 재게시 PNG](https://logo.vision1098.com/entry/서울대학교-로고-CI-파일ai-png). 공식 UI 다운로드는 교직원 로그인 전용이라 재게시본 사용 | 원본 파랑 교표 유지, 국영문 글자만 lightText |
| sia.png | 서울예술대학교 | [공식 UI](https://www.seoularts.ac.kr/web/content.do?proFn=9131000)의 첨부 ZIP 내 `서울예대_로고타입.pdf`를 300dpi 렌더·크롭한 회사소개서 PNG | 빨강 심벌 유지, 국영문 글자만 lightText |
| hanyang_signature.png | 한양대학교 | [공식 로고 응용](https://www.hanyang.ac.kr/web/www/logo-application)의 `Signature_lr_basic_kor` | PNG 투명 여백 트림, 파랑 교표 유지, 국문 글자만 lightText |
| seoul.png | 서울특별시 | [공식 상징물](https://www.seoul.go.kr/seoul/emblem.do)의 `ci_png.zip`(2023-05), `좌우조합_서울특별시` | 투명 여백 트림, 컬러 심벌 유지, 국문 글자만 lightText |
| rollsroyce_combo.svg | 롤스로이스 | [Commons: Rolls royce northamerica logo](https://commons.wikimedia.org/wiki/File:Rolls_royce_northamerica_logo.svg) | 지정 plc 계열 가로 조합 그대로, 파랑 RR 배지 유지, 오른쪽 워드마크만 lightText |
| ktds.svg | kt ds | [Commons: KTDS Logo](https://commons.wikimedia.org/wiki/File:KTDS_Logo.svg) | 사본의 검정 `#242424` 경로만 `#FBF9F6`로 변환, 빨강 `#EC1C24`와 형상 유지 |
| kiost.png | 한국해양과학기술원(KIOST) | [공식 CI](https://www.kiost.ac.kr/kor/sub04_08_01.do)의 `KIOST_Signature_png.zip`, `국문좌우조합` | 투명 여백 트림, KIOST 영문·컬러 심벌 유지, 오른쪽 국문만 lightText |

lightText는 기존 Clients 컴포넌트의 알파 마스크 방식이며 공식 흰색 CI 파일이라는 뜻은 아니다. 마스크 좌표는 저장된 웹 자산 기준이다. 서울대학교·한양대학교·롤스로이스의 파랑 심벌은 원본색을 유지한다.

롤스로이스는 사용자 지정 `rollsroyce_combo.svg`만 사용했다. 출처상 plc 계열 북미 법인 브랜딩이며 Motor Cars 로고로 해석하지 않는다. 서울관광재단(sto)·대한체육회·BIFAN·서울대 교표 단독·다른 롤스로이스 자산은 추가하지 않았다.

해보자시리즈를 맨 앞에 두고 회사소개서 순서로 19곳을 배치했다. 기존 두 줄 이동 레이아웃과 다른 섹션은 변경하지 않았다.

## 09-25 다크 배경 컬러 시안

사용자가 참고 이미지의 여백과 밝은 글자 표현을 승인했다. 두 줄 흐름 유지, 최대 폭 1600px 및 열 간격 280px로 조정. RAVNUS 보라·초록 등 심벌 색은 그대로 유지한다.

NEXON은 공식 다크용 파일. 해군·공군·매치워크·교보생명·LS ELECTRIC·한국공학대학교는 공식 다크용 자산이 아니라 **로컬 표시 시안**이다. 원본 이미지 위에 SVG 알파 마스크로 글자 영역만 밝게 표시한다. 원본 파일과 컬러 심벌은 변경하지 않았다. 마스크 좌표는 현재 원본 기준이므로 파일 교체 시 다시 확인해야 한다.

## 최종 선택: 두 줄·컬러 유지

사용자가 두 줄 배치를 확정하고 로고 색상 제거를 거부했다. 두 줄을 기본으로 고정하고 비교용 query 스크립트를 삭제했다. RAVNUS는 최초 보라·초록 원본, 매치워크·한국공학대는 컬러 원본으로 복원. 해군·공군·교보·LS의 단색 CSS 필터 삭제. NEXON은 컬러 심볼을 유지하는 공식 어두운 배경용 버전 유지.

Mnet `mnet-color.svg`: 공식 투명 흰색 PNG를 SVG 알파 마스크로 사용하고 최초 공식 컬러 JPG의 주 색상 `#f500d0`로 표시한다. 도형 재생성이나 배경 추가 없이 투명 컬러 로고를 렌더한다. 원본 파일들은 그대로 보존했다.

아래 흰색 처리 기록은 이전 시안 이력이다.

## 09-25 사용자 피드백 반영: 어두운 배경

- 버튼·개업 전 안내 문구 삭제. 한 줄 기본, 개발 서버에서만 `?clients=2`로 두 줄 비교.
- 해보자: 원본 JPG 보존. `haeboja-transparent.png`는 built-in imagegen으로 배경 제거한 시안. RGBA 알파 0~255 확인. 생성 특성상 원본 선·질감에 미세한 차이가 있어 최종 확인 대상.
- 해보자 프롬프트: "Strict background-removal edit. Output RGBA PNG with actual alpha=0 outside the existing logo silhouette. Do not paint a checkerboard. Do not redraw or reinterpret the cartoon. Preserve exactly the attached original face, cap, flat colors, lines, and the text 해보자. Remove only exterior white backdrop. Transparent background, actual alpha transparency, no checkerboard pattern, no gray backdrop. Original logo is the only foreground object."
- Mnet: 투명 공식 흰색 PNG `https://web-cf-image.cjenm.com/public/resources/images/logo/img_dk_logo_17.png`.
- RAVNUS: 공식 `https://ravnus.com/wp-content/uploads/2024/07/RAVNUS-white.webp`.
- 매치워크: 공식 `https://cdn.imweb.me/thumbnail/20260210/aad41995bdb7e.png`.
- 한국공학대: 공식 `https://www.tukorea.ac.kr/sites/tukorea/images/common/logo_w.png`.
- NEXON: 같은 공식 CI ZIP의 `SVG/Signature-Horizontal_RGB_BlackBG.svg`.
- 해군·공군·교보생명·LS는 원본 파일 그대로 보관하고 CSS에서 흰색 단색 표시. ONSIDE의 검정 바탕은 화면 합성으로 주변 배경에 맞춘다.

아래는 최초 수집 원본 기록이다.

2026-09-25 수집. 원본 파일 그대로 로컬 저장. 색상 재가공 없음.

| 파일 | 원본 URL |
|---|---|
| ravnus.webp | https://ravnus.com/wp-content/uploads/2024/07/RAVNUS.webp |
| navy.svg | https://ravnus.com/wp-content/uploads/rok-navy.svg |
| airforce.svg | https://ravnus.com/wp-content/uploads/대한민국_공군_로고.svg |
| tukorea.png | https://www.tukorea.ac.kr/sites/tukorea/images/common/logo_c.png |
| ls.png | https://www.ls-electric.com/assets/img/common/logo1.png |
| mnet.jpg | https://img.cjnews.cj.net/wp-content/uploads/2020/10/Mnet_EntertainmentMedia__01.jpg |
| kyobo.png | https://resource.kyobo.com/dgt/web/pc/common/img/common/ci_kyobo_header.png |
| matchwork.png | https://cdn.imweb.me/thumbnail/20260210/9b25d78210076.png |
| haeboja.jpg | https://yt3.googleusercontent.com/iDt5A7L8Jwm7pf2KmAaid5xZKx6pSP1Zdv_uDMUKI9AeETyx3_tMwqbtHLh3nKqCdCiuMOUbMZw=s240-c-k-c0x00ffffff-no-rj |
| nexon.svg | https://brand.nexon.com/resources/ci-guideline/NEXON_CI_%20Horizontal_RGB.zip (SVG/Signature-Horizontal_RGB_WhiteBG.svg) |
| semics.svg | https://ravnus.com/wp-content/uploads/semics.svg |
| onside.png | https://cdn.imweb.me/upload/S20240203ecf822d8bd96f/d23fa6d92c307.png |

해군·공군·SEMICS는 레이븐어스 공개 사이트에 게시된 SVG. SEMICS 공식 사이트의 로고와 모양을 대조했다. 나머지는 각 공식 사이트 또는 공식 채널 이미지다. ONSIDE는 공식 사이트 og:image. 해보자시리즈는 공식 YouTube 채널 UCe-7GwWL1XNlCJyfqBhgrHA 프로필이다.

추가: public/images/clients/에 원본을 넣고 src/data/clients.ts에 항목 추가. 이미지 alt는 name에서 생성된다. 현재 관리자 편집 항목에는 포함하지 않는다.

표기: 대표 참여 프로젝트의 브랜드·기관. 개업 전 참여 작업 포함. 직접 계약 관계를 일괄 주장하지 않는다.
