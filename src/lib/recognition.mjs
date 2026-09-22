// Archive text takes precedence for each work, matching the full-work page.
const normalized = (text) => text.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
const dateIn = (text) => text.match(/\b(20\d{2})(?:\.(0?[1-9]|1[0-2]))?\b/)?.[0] ?? '';
const dateKey = (text) => {
  const [year, month = 0] = text.split('.').map(Number);
  return year ? year * 100 + month : -1;
};

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
      const item = { workId: row.id, work: row.name, text: line, year: dateIn(line) || match?.year || '', source: match?.source || '' };
      // Distribution / streaming credits stay visible without being called awards.
      if (/배급|Google Play|Apple TV|왓챠|티빙|쿠팡플레이|넷플릭스/.test(line)) {
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
    events.push({ workId: k.workId || '', work, year: k.year || '', text: `${k.title} · ${k.detail.replace(/^「[^」]+」\s*/, '')}`, source: k.source || '' });
  }
  events.sort((a, b) => dateKey(b.year) - dateKey(a.year));
  return { events, releases };
}
