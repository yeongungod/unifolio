// 화면 표시용 글자 정리. 원본 데이터(노션·관리자)는 그대로 두고 그릴 때만 쓴다.
// SUITE엔 대시(—·–·−)와 이모지 글리프가 없다(DESIGN.md The No Dash Rule).
export const displayText = (s) => s.replace(/\s*[—–−]\s*/g, ' - ').replace(/\s*[☀-➿\u{1F000}-\u{1FAFF}️]+/gu, '').trim();
// 「2025 -」(진행 중)은 뒤에 구분점이 붙으면 「2025 - ·」로 읽혀서 「2025~」로
export const displayYear = (s) => s.replace(/\s*-\s*$/, '~');
// 무대 크레딧 줄 [라벨, 값] (v7 B, 웹 크레딧 축의 축소판). 원본 칸은 그대로, 그릴 때만 나눈다.
// 의뢰처가 감독이면 「연출 이름 · 연도」, 제목이 의뢰처로 시작하면 「연도」만, 그 밖엔 「의뢰」.
// 역할에 소리 일이 있으면 「사운드」, 아니면 「역할」. 한 줄 소개는 문장마다: 「… 배급」 → 배급, 「…상」 → 수상, 그 밖 → 비고.
export function creditRows({ title, client, role, year, note }) {
  const t = displayText(title), c = displayText(client), y = displayYear(year);
  const rows = [/감독$/.test(c) ? ['연출', `${c.replace(/\s*감독$/, '')} · ${y}`] : !c || t.startsWith(c) ? ['연도', y] : ['의뢰', `${c} · ${y}`]];
  if (role) rows.push([/믹싱|사운드|녹음|폴리|ADR|마스터링/.test(role) ? '사운드' : '역할', displayText(role)]);
  for (const s of displayText(note).split(/(?<=\.)\s+/).map((x) => x.replace(/\.$/, '').trim()).filter(Boolean)) {
    rows.push(/배급$/.test(s) ? ['배급', s.replace(/\s*배급$/, '')] : /상$/.test(s) ? ['수상', s] : ['비고', s]);
  }
  return rows;
}
