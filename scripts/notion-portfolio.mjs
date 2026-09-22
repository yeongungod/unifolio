// Notion 응답 중 사이트에 필요한 속성만 사용한다. 원본 응답은 저장하지 않는다.
const PLATFORM = { Flim: 'Film', Film: 'Film', 'Live Sound': 'Live', Live: 'Live', Music: 'Music', 'Web Content': 'Web', Web: 'Web', Edit: 'Edit', 'Game Sound': 'Game', Game: 'Game', Filming: 'Filming', '촬영': 'Filming' };
const PROCESS = { Mixing: '믹싱', 'Sound Design': '사운드디자인', ADR: 'ADR', Foley: '폴리', Record: '녹음', Mastering: '마스터링', 'Sound Assistant': '사운드 어시스트', PA: 'PA', Cinamatic: '시네마틱', Skill: '스킬', UI: 'UI' };
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const text = (p) => (p?.title ?? p?.rich_text ?? []).map((r) => r.plain_text ?? r.text?.content ?? '').join('').trim();

function fieldText(props, name, required = false) {
  const value = text(props[name]);
  if ((required && !value) || value.length > 2000 || /[\u0000-\u0008]/u.test(value)) throw new Error(`노션 ${name} 값이 없거나 너무 깁니다.`);
  return value;
}

function video(value) {
  if (!value) return {};
  let url;
  try { url = new URL(value); } catch { throw new Error('영상 URL 형식이 잘못되었습니다.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) || url.hostname.endsWith('.local')) throw new Error('영상 URL은 공개 HTTPS 주소여야 합니다.');
  let youtube;
  if (url.hostname === 'youtu.be') youtube = url.pathname.slice(1);
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) youtube = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1];
  if (youtube && !/^[\w-]{11}$/.test(youtube)) throw new Error('유튜브 영상 URL이 잘못되었습니다.');
  return { url: url.href, ...(youtube ? { youtube } : {}) };
}

export function convertPages(pages, existingFeatured = []) {
  const archive = [], cards = [], downloads = [], ids = new Set(), ranks = new Set();
  for (const page of pages) {
    const p = page.properties ?? {};
    if (page.archived || page.in_trash || p['사이트 공개']?.checkbox !== true) continue;
    if (!UUID.test(page.id) || ids.has(page.id)) throw new Error('노션 페이지 ID가 잘못되었거나 중복입니다.');
    ids.add(page.id);
    const name = fieldText(p, '사이트 표시명') || fieldText(p, 'Name', true);
    const year = p.Date?.number;
    if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new Error('노션 Date에 작업 연도를 입력하세요.');
    const client = fieldText(p, '사이트 클라이언트 표기') || fieldText(p, 'Client');
    const platform = (p.Platform?.multi_select ?? []).map((x) => PLATFORM[x.name]);
    const process = (p.Process?.multi_select ?? []).map((x) => x.name);
    if (!platform.length || platform.some((x) => !x) || process.some((x) => typeof x !== 'string' || !x.trim())) throw new Error('분야 또는 작업 역할에 지원하지 않는 값이 있습니다.');
    const link = video(p['영상 URL']?.url);
    if (p['수상·상영'] && p['수상·상영'].type !== 'rich_text') throw new Error('노션 수상·상영 속성은 텍스트여야 합니다.');
    const recognitionText = fieldText(p, '수상·상영');
    const recognition = recognitionText ? { recognition: recognitionText } : {};
    if (p['전체 작업 표시']?.checkbox === true) archive.push({ id: page.id, year, name, platform, process, client, ...recognition, ...(link.url ? { url: link.url } : {}) });
    const rank = p['대표작 순서']?.number;
    if (rank == null) continue;
    if (!Number.isInteger(rank) || rank < 1 || rank > 9 || ranks.has(rank)) throw new Error('대표작 순서는 중복 없는 1~9 정수여야 합니다.');
    ranks.add(rank);
    const files = p['썸네일']?.files ?? [];
    if (files.length > 1) throw new Error('대표작 썸네일은 한 개만 지정하세요.');
    const fileUrl = files[0]?.file?.url ?? files[0]?.external?.url;
    const legacy = existingFeatured.find((item) => (item.notionId ?? item.slug) === page.id)?.image;
    const image = fileUrl ? `/images/notion/${page.id}.jpg` : !link.youtube && /^\/images\/work\/[\w-]+\.(jpg|png|webp)$/.test(legacy ?? '') ? legacy : undefined;
    if (!link.youtube && !image) throw new Error('대표작에는 유튜브 영상 또는 썸네일이 필요합니다.');
    if (fileUrl) downloads.push({ url: fileUrl, image });
    cards.push({ rank, slug: page.id, title: name, role: fieldText(p, '사이트 역할 표기') || process.map((x) => PROCESS[x] ?? x).join(' · '), year: fieldText(p, '사이트 연도 표기') || String(year), client, note: fieldText(p, '한 줄 소개'), ...link, ...(image ? { image } : {}) });
  }
  if (!archive.length || !cards.length) throw new Error('전체 작업 또는 대표작이 비었습니다. 노션 공개/표시 설정을 확인하세요.');
  return { archive: archive.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id)), featured: cards.sort((a, b) => a.rank - b.rank).map(({ rank, ...card }) => card), downloads };
}

export async function fetchPortfolio({ token, dataSourceId, fetcher = fetch, existingFeatured = [] }) {
  if (!token) throw new Error('Notion 연결이 없습니다. docs/portfolio-management.md의 최초 연결을 진행하세요.');
  if (!UUID.test(dataSourceId ?? '')) throw new Error('NOTION_DATA_SOURCE_ID를 확인하세요.');
  const pages = [], cursors = new Set();
  let cursor;
  do {
    let response;
    try {
      response = await fetcher(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2026-03-11', 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_size: 100, filter: { property: '사이트 공개', checkbox: { equals: true } }, ...(cursor ? { start_cursor: cursor } : {}) }),
      });
    } catch { throw new Error('Notion 연결에 실패했습니다. 기존 파일은 유지됩니다.'); }
    if (!response.ok) throw new Error(`Notion HTTP ${response.status}. 토큰·DB 연결·사이트 공개 속성을 확인하세요.`);
    let body;
    try { body = await response.json(); } catch { throw new Error('Notion 응답 형식이 올바르지 않습니다.'); }
    if (!Array.isArray(body.results) || typeof body.has_more !== 'boolean') throw new Error('Notion 목록 응답이 올바르지 않습니다.');
    pages.push(...body.results);
    cursor = body.has_more ? body.next_cursor : undefined;
    if (body.has_more && (!cursor || cursors.has(cursor))) throw new Error('Notion 목록을 끝까지 읽지 못했습니다.');
    if (cursor) { cursors.add(cursor); await new Promise((resolve) => setTimeout(resolve, 350)); }
  } while (cursor);
  return convertPages(pages, existingFeatured);
}

export async function downloadImage(value, fetcher = fetch) {
  let url;
  try { url = new URL(value); } catch { throw new Error('썸네일 이미지 주소가 올바르지 않습니다.'); }
  const allowed = /^(?:[a-z0-9.-]+\.)?s3\.[a-z0-9-]+\.amazonaws\.com$/.test(url.hostname) || url.hostname === 'file.notion.so' || (url.hostname === 'yeongungod.com' && url.pathname.startsWith('/images/work/'));
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !allowed) throw new Error('이미지는 Notion에 직접 업로드하거나 기존 사이트 작업 이미지로 지정하세요.');
  let response;
  try { response = await fetcher(url.href, { redirect: 'error', signal: AbortSignal.timeout(20000) }); } catch { throw new Error('썸네일 이미지 다운로드에 실패했습니다.'); }
  const mime = response.headers.get('content-type')?.split(';')[0];
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
  const limit = 8 * 1024 * 1024;
  if (!response.ok || !extension || !response.body || Number(response.headers.get('content-length')) > limit) throw new Error('썸네일 이미지는 8MB 이하 JPG/PNG/WebP여야 합니다.');
  const chunks = []; let size = 0;
  try {
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > limit) throw new Error('size');
      chunks.push(chunk);
    }
  } catch { throw new Error('썸네일 이미지가 너무 크거나 전송이 중단되었습니다.'); }
  const bytes = Buffer.concat(chunks);
  const valid = extension === 'jpg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : extension === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) throw new Error('썸네일 이미지 파일 형식이 올바르지 않습니다.');
  return { bytes, extension };
}
