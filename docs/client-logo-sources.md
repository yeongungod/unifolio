# 클라이언트 로고 출처

## 10-07 추가 (최종 ORDER_261007c 기준)

기존 17곳에 한국연예제작자협회·RAPBEAT·왓슨앤컴퍼니·BIFAN·ITEASY를 추가하여 총 22곳, 두 줄 11/11로 확정했다. 일반 이용약관·회원약관의 콘텐츠 복제 조항은 제외 사유가 아니며 로고·CI 전용 제한을 확인한다. GATSBY는 최종 지시의 별도 제외 결정을 따른다.

| 대상·파일 | 공식 출처 | 처리·배치 | scale |
|---|---|---|---:|
| 한국연예제작자협회 / kepa.png | [홈페이지](https://kepa.net/), [헤더 CSS](https://kepa.net/css/global.css), [원본 JPG](https://kepa.net/images/main/logo.jpg) | kepa-original.jpg 보존. 흰 매트 제거·투명 여백 트림. 컬러 심벌 유지, x=45 이후 글자만 lightText. KIOST 다음 | 1.14 |
| RAPBEAT / rapbeat.png | [홈페이지](https://www.rapbeatfestival.com/), [원본 PNG](https://www.rapbeatfestival.com/images/common/logo.png) | rapbeat-original.png 보존. 투명 여백만 트림. 원래 검정 단색 워드마크를 lightText로 밝게 표시. Mnet 다음 | 0.67 |
| 왓슨앤컴퍼니 / watson.png | [홈페이지](https://watsonxi.com/), [원본 PNG](https://watsonxi.com/images/common/logo-on.png) | 원본 그대로. 청록 파형 유지, x=70 이후 글자만 lightText. 매치워크 다음 | 0.88 |
| BIFAN / bifan-white.svg | [홈페이지](https://www.bifan.kr/), [공식 흰색 SVG](https://www.bifan.kr/web/images/main/main2026_ff_bi_logo_w.svg) | 에디션 없는 BIFAN 워드마크 원본 그대로. KIOST·협회 근처 | 0.73 |
| ITEASY / iteasy-white.png | [공식 기업 사이트](https://company.iteasy.co.kr/), [공식 흰색 PNG](https://company.iteasy.co.kr/images/white_logo.png) | 푸터의 공식 흰색판 원본 그대로. 왓슨앤컴퍼니와 LS ELECTRIC 사이 | 1.05 |

BIFAN 참여 근거는 2022 「AREA 1997」 웹 영상 믹싱·사운드디자인·폴리·마스터링의 실제 의뢰처다. 상영처라는 이전 설명은 폐기한다. 기존 17곳의 자산·배율·Clients 컴포넌트·작업 및 수상 데이터는 변경하지 않았다.

### 최종 제외 3곳

| 대상 | 사유 |
|---|---|
| 강남대학교 | [공식 로고·UI 페이지](https://web.kangnam.ac.kr/menu/0a4747b9674cfaf5d070b3786db9c51a.do)에 복제·배포·상업적 사용 금지 명시 |
| GATSBY | [공식 브랜드 사이트](https://www.gatsby.jp/)가 연결한 [맨담 이용조건](https://www.mandom.co.jp/siteinfo/)의 상표 무단 사용 금지 조항으로 사용자 보수적 제외 확정 |
| 서울아트비디오페스티벌 | 사용자 제외 결정. 사이트 로고 추가 없음, 「살아지다」 음향상 등 수상 이력 보존 |

BIFAN·ITEASY의 일반 약관을 근거로 한 앞선 보류는 최종 지시에 따라 해제했다. 출처·제외 판단 기록이며 명시적 이용허락을 취득했다는 뜻은 아니다. 법률 자문 아님.

### 1440px 표시 크기 검증

Canvas alpha > 16 픽셀의 외곽 사각형을 측정하고 실제 contain 배율과 scale을 반영했다. 약 5,600px² 기준은 잉크 외곽 사각형 면적으로 해석하며, 칠해진 픽셀 면적과 구분한다. SVG는 브라우저 기본 래스터 크기에서 측정한 근삿값이다.

| 로고 | 원본 / 웹 자산 | scale | 화면 외곽(px) | 외곽 면적(px²) | 칠해진 픽셀 면적(px²) |
|---|---|---:|---|---:|---:|
| 한국연예제작자협회 | 295×76 / 295×39 | 1.14 | 205.20×27.13 | 5,566.69 | 1,778.15 |
| RAPBEAT | 278×79 / 148×75 | 0.67 | 105.77×53.60 | 5,669.33 | 3,754.53 |
| 왓슨앤컴퍼니 | 205×46 / 동일 | 0.88 | 158.40×34.77 | 5,507.68 | 2,452.04 |
| BIFAN | viewBox 79×26 / 동일 | 0.73 | 131.40×43.36 | 5,697.75 | 2,583.36 |
| ITEASY | 166×27 / 동일 | 1.05 | 189.00×29.60 | 5,594.86 | 2,746.87 |

협회 흰 매트 제거는 alpha = 255 - min(R,G,B), alpha < 12 제거 후 역매트 계산. 트림 (0,17)-(295,56). RAPBEAT 트림 (65,2)-(213,77). 재그리기·AI 생성 없음. 협회 JPG 압축 가장자리에는 미세 오차가 있을 수 있다. lightText는 공식 흰색판이 아닌 기존 사이트 표시 방식이다. BIFAN·ITEASY는 공식 흰색 자산 자체다.

검증: npm run build, npm run check(3페이지), npm test(36개) 통과. 재빌드 후 preview 서버를 재시작하여 1440/375px에서 22개 로드, 11/11 두 줄, 페이지 가로 넘침·JS 오류 없음 확인. 보고서와 스크린샷은 G:/91_uniStudio/261007_사이트_로고추가/에 있다. 로컬 커밋만, push·배포 없음.

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
