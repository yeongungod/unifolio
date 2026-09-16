export type Featured = {
  slug: string; title: string; role: string; year: string; client: string;
  youtube?: string;   // 유튜브 영상 ID. 있으면 클릭 시 재생
  image?: string;     // youtube 없을 때 /images/work/ 경로
  note: string;
};

export const featured: Featured[] = [
  { slug: 'haebojaseries', title: '해보자시리즈', role: '유튜브 롱폼·쇼츠 편집', year: '2025 –', client: '해보자시리즈', youtube: 'G7P6u0izwsk', note: '구독자 15만 게임 채널. 롱폼·쇼츠 편집, 썸네일 문구까지.' },
  { slug: 'soulmate', title: '나의 소울메이트', role: '믹싱 · 사운드디자인 · ADR · 폴리 · 마스터링', year: '2025', client: '이채범 감독', image: '/images/work/soulmate.jpg', note: '단편영화 사운드 전 공정.' },
  { slug: 'chimmuk', title: '침묵', role: '믹싱 · 사운드디자인 · 폴리 · 마스터링', year: '2022', client: '배준원 감독', image: '/images/work/chimmuk.jpg', note: '제18회 대한민국대학영화제 최우수작품상 · 여자연기상. 인디스토리 배급.' },
  { slug: 'saraji', title: '살아지다', role: '믹싱 · 사운드디자인 · ADR · 폴리 · 녹음 · 마스터링', year: '2023', client: '정도영 감독', image: '/images/work/saraji.jpg', note: '서울아트비디오페스티벌 음향상.' },
  { slug: 'navy', title: '대한민국 해군 · 공군 웹콘텐츠', role: '믹싱 · 사운드디자인 · 마스터링', year: '2023 – 25', client: '대한민국 해군 · 공군', youtube: '4j_y34frjNU', note: '창설 기념 광고, 훈련소 다큐, 정신전력 교육 영상 등 7건.' },
  { slug: 'kazan', title: '퍼스트 버서커: 카잔 | 전설을 만들다', role: '녹음 · 사운드 어시스트', year: '2025', client: 'NEXON', youtube: 'TbFCH78wKlc', note: '게임 출시 웹콘텐츠 현장 녹음.' },
  { slug: 'onside', title: '온사이드 팬미팅 시리즈', role: '라이브 PA', year: '2023 – 25', client: 'ONSIDE COMPANY', image: '/images/work/onside.jpg', note: '마젠타·수련수련·임마초·최솜이 등 팬미팅·콘서트 9회 현장 음향.' },
  { slug: 'tfd', title: 'The First Descendant — UI 사운드', role: '사운드디자인 데모', year: '2025', client: '개인 작업', youtube: 'WKvy_jR7frU', note: 'Sci-Fi UI 효과음 재해석. 개인 포트폴리오 영상.' },
];
