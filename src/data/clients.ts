// 로고 추가: public/images/clients/에 파일을 넣고 아래 목록에 한 줄 추가.
// 수집 출처: docs/client-logo-sources.md
// scale: 화면에 실제로 보이는 면적이 비슷해지도록 맞춘 배율(2026-09-29, 1440px에서 로고별 잉크 영역을 재서 약 5,600px²로 통일). 로고를 바꾸면 다시 잴 것
export const clients = [
  { name: '서울대학교', scale: 0.87, file: 'snu_signature.png', lightText: { width: 1377, height: 314, x: 340, y: 0 } },
  { name: '서울예술대학교', scale: 0.86, file: 'sia.png', lightText: { width: 3234, height: 754, x: 765, y: 0 } },
  { name: '한양대학교', scale: 0.81, file: 'hanyang_signature.png', lightText: { width: 591, height: 159, x: 170, y: 0 } },
  { name: '대한민국 해군', scale: 0.97, file: 'navy.svg', lightText: { width: 1210.86, height: 283.46, x: 290, y: 0 } },
  { name: '대한민국 공군', scale: 0.92, file: 'airforce.svg', lightText: { width: 265.79, height: 58.74, x: 110, y: 0 } },
  { name: 'RAVNUS', scale: 0.96, file: 'ravnus.webp' },
  { name: '롤스로이스', scale: 0.89, file: 'rollsroyce_combo.svg', lightText: { width: 404, height: 95, x: 75, y: 0 } },
  { name: 'kt ds', scale: 0.66, file: 'ktds.svg' },
  { name: 'NEXON', scale: 0.77, file: 'nexon-dark.svg' },
  { name: 'Mnet', scale: 0.93, file: 'mnet-color.svg', small: true },
  { name: 'RAPBEAT', scale: 0.67, file: 'rapbeat.png', lightText: { width: 148, height: 75, x: 0, y: 0 } },
  { name: '교보생명', scale: 0.77, file: 'kyobo.png', lightText: { width: 240, height: 70, x: 0, y: 40 } },
  { name: '한국해양과학기술원(KIOST)', scale: 0.98, file: 'kiost.png', lightText: { width: 2641, height: 429, x: 1055, y: 0 } },
  { name: '한국연예제작자협회', scale: 1.14, file: 'kepa.png', lightText: { width: 295, height: 39, x: 45, y: 0 } },
  { name: '부천국제판타스틱영화제(BIFAN)', scale: 0.73, file: 'bifan-white.svg' },
  { name: '매치워크', scale: 1.04, file: 'matchwork.png', lightText: { width: 543, height: 147, x: 0, y: 52 } },
  { name: '왓슨앤컴퍼니', scale: 0.88, file: 'watson.png', lightText: { width: 205, height: 46, x: 70, y: 0 } },
  { name: 'ITEASY', scale: 1.05, file: 'iteasy-white.png' },
  { name: 'LS ELECTRIC', scale: 0.98, file: 'ls.png', lightText: { width: 177, height: 28, x: 55, y: 10 } },
  { name: 'SEMICS', scale: 0.77, file: 'semics.svg' },
  { name: 'ONSIDE COMPANY', scale: 1.27, file: 'onside.png', cover: true },
  { name: '한국공학대학교', scale: 0.88, file: 'tukorea.png', lightText: { width: 195, height: 43, x: 46, y: 0 } },
];
