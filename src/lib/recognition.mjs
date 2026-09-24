// Archive text takes precedence for each work, matching the full-work page.
const normalized = (text) => text.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
const dateIn = (text) => text.match(/\b(20\d{2})(?:\.(0?[1-9]|1[0-2]))?\b/)?.[0] ?? '';
const dateKey = (text) => {
  const [year, month = 0] = text.split('.').map(Number);
  return year ? year * 100 + month : -1;
};

export function formatRecognition(record) {
  let text = record.text.trim().replace(/\.$/, '');
  if (record.kind === 'distribution') return `배급 · ${text.replace(/\s*배급$/, '')}`;
  if (record.kind === 'platform') return `상영 플랫폼 · ${text.replace(/Google Play 영화\s*[,·]\s*무비/g, 'Google Play 무비/TV').replace(/\s*상영 중$/, '').replace(/,\s*/g, ' · ')}`;
  text = text.replace(/\b20\d{2}(?:\.\d{1,2})?\b/g, '')
    .replace(/\(\s*,\s*/g, '(').replace(/\(\s*\)/g, '')
    .replace(/,\s*/g, ' · ').replace(/\s+/g, ' ').trim();
  return text;
}

// Group labels are production years; event dates remain in source data for sorting.
export function groupedRecognition(rows, awards, screenings, featured = []) {
  const { events, releases } = mainRecognition(rows, awards, screenings);
  for (const item of featured) {
    const text = item.note.split('.').map(s => s.trim()).find(s => s.endsWith('배급'));
    if (text && !releases.some(r => r.workId === item.slug && r.kind === 'distribution')) {
      const row = rows.find(r => r.id === item.slug);
      if (row) releases.push({ workId: row.id, work: row.name, text, year: '', source: '', kind: 'distribution' });
    }
  }
  const groups = new Map();
  for (const [index, record] of [...events, ...releases].entries()) {
    const key = record.workId || `standalone-${index}`;
    const row = rows.find(r => r.id === record.workId);
    if (!groups.has(key)) groups.set(key, { workId: record.workId, work: record.work, year: String(row?.year || record.year).slice(0, 4), records: [] });
    groups.get(key).records.push({ ...record, text: formatRecognition(record) });
  }
  const order = { event: 0, platform: 1, distribution: 2 };
  for (const group of groups.values()) group.records.sort((a, b) => order[a.kind] - order[b.kind]);
  return [...groups.values()].sort((a, b) => Number(b.year) - Number(a.year));
}

export function mainRecognition(rows, awards, screenings) {
  const events = [];
  const releases = [];
  const known = [
    ...awards.map((a) => ({ ...a, detail: a.body })),
    ...screenings,
  ];
  const overridden = new Set();
  for (const row of rows) {
    if (!row.recognition?.trim()) continue;
    overridden.add(row.id);
    const lines = [...new Set(row.recognition.split(/\r?\n/).map((s) => s.trim()).filter(Boolean))];
    for (const line of lines) {
      const match = known.find((k) => k.workId === row.id && normalized(line).includes(normalized(k.title)));
      const kind = /배급/.test(line) ? 'distribution' : /Google Play|Apple TV|왓챠|티빙|쿠팡플레이|넷플릭스/.test(line) ? 'platform' : 'event';
      const item = { workId: row.id, work: row.name, text: line, year: dateIn(line) || match?.year || '', source: match?.source || '', kind };
      // Distribution / streaming credits stay visible without being called awards.
      if (kind !== 'event') {
        releases.push(item);
      } else {
        // Prefer the known event month when the archive only supplies its year.
        if (match?.year && (!item.year || match.year.startsWith(item.year))) item.year = match.year;
        events.push(item);
      }
    }
  }
  for (const k of known) {
    if (k.workId && overridden.has(k.workId)) continue;
    const work = rows.find((row) => row.id === k.workId)?.name || '';
    events.push({ workId: k.workId || '', work, year: k.year || '', text: `${k.title} · ${k.detail.replace(/^「[^」]+」\s*/, '')}`, source: k.source || '', kind: 'event' });
  }
  events.sort((a, b) => dateKey(b.year) - dateKey(a.year));
  return { events, releases };
}
