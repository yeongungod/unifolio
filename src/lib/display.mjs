// 화면 표시용 글자 정리. 원본 데이터(노션·관리자)는 그대로 두고 그릴 때만 쓴다.
// 무대·크레딧 글자: 대시(—·–·−)는 「 - 」 하나로 통일하고 그림 글자는 뺀다(/work 표는 원문 그대로).
export const displayText = (s) => s.replace(/\s*[—–−]\s*/g, ' - ').replace(/\s*[☀-➿\u{1F000}-\u{1FAFF}️]+/gu, '').trim();
// 연도: 「2025 -」(진행 중)은 「2025~」, 「2023 - 25」·「2023-2025」 같은 기간은 「2023–2025」(10-19 사용자, Pretendard엔 – 글리프가 있다)
export const displayYear = (s) => displayText(String(s))
  .replace(/^(\d{4})\s*-\s*(\d{2}|\d{4})$/, (_, a, b) => `${a}–${b.length === 2 ? a.slice(0, 2) + b : b}`)
  .replace(/\s*-\s*$/, '~');
// 줄이 구분 기호(· | - – —)나 한두 자리 숫자(「섹션 5」)로 시작하지 않게 앞 공백을 붙는 공백으로
export const glue = (t) => t.replace(/ ([·|\-–—]) /g, '\u00a0$1 ').replace(/ (\d{1,2})(?=\s|$)/g, '\u00a0$1');
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
