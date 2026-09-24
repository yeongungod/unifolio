# 클라이언트 로고 출처

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
