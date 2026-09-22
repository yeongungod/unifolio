import archive from '../../data/archive.json';
import archiveSource from '../../data/archive.json?raw';
import { featured } from '../../data/featured';
import cardSource from '../../data/featured.ts?raw';
import { site } from '../../data/site';
import { sourceHash } from '../../lib/admin-portfolio.mjs';

// This endpoint contains existing public source only. Never read draft storage here.
export function GET() {
  const items = archive.map((r) => ({ ...r, public: true, archive: true, rank: 0, title: r.name, displayYear: String(r.year), role: r.process.join(' · '), note: '', image: '', upload: '' }));
  featured.forEach((card, i) => {
    let item = items.find((r) => r.id === card.slug);
    if (!item) {
      item = { id: card.slug, name: card.title, year: Number(card.year.slice(0, 4)), platform: [card.title.includes('팬미팅') ? 'Live' : 'Web'], process: [card.role], client: card.client, public: true, archive: false, rank: 0, title: card.title, displayYear: card.year, role: card.role, note: '', image: '', upload: '' };
      items.push(item);
    }
    Object.assign(item, { rank: i + 1, title: card.title, displayYear: card.year, role: card.role, note: card.note, image: card.image || '', url: card.url || ('url' in item ? item.url : '') });
  });
  const recognition = Object.fromEntries(archive.map((r) => [r.id, [
    ...site.about.awards.filter((a) => a.workId === r.id).map((a) => `${a.year} ${a.title}\n${a.body.replace(/^「[^」]+」\s*/, '')}`),
    ...site.screenings.filter((s) => s.workId === r.id).map((s) => `${s.year} ${s.title}\n${s.detail}`),
  ].join('\n\n')]));
  return new Response(JSON.stringify({ document: { base: sourceHash(archiveSource, cardSource), items }, recognition }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
