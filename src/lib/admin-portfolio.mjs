import { createHash } from 'node:crypto';

export const OWNER_EMAIL = 'unistudio@yeongungod.com';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const FEATURED_TYPE = 'export type Featured = { slug: string; title: string; role: string; year: string; client: string; youtube?: string; image?: string; url?: string; note: string };';
export const digest = (text) => createHash('sha256').update(text).digest('hex');
export const sourceHash = (archive, featured) => digest(JSON.stringify([archive.replace(/\r\n/g, '\n'), featured.replace(/\r\n/g, '\n')]));
export const featuredSource = (cards) => `${FEATURED_TYPE}\nexport const featured: Featured[] = ${JSON.stringify(cards, null, 2)};\n`;
export function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }

export function assertOwner(user, registeredId) {
  if (!registeredId || user?.id !== registeredId || user.email !== OWNER_EMAIL || !user.email_confirmed_at || user.app_metadata?.provider !== 'google' || !user.identities?.some((i) => i.provider === 'google' && i.identity_data?.email === OWNER_EMAIL && i.identity_data.email_verified === true)) fail('허용된 Google 계정으로 로그인하세요.', 403);
}
export function assertReview(received, current) {
  if (!received || ['revision', 'hash', 'head'].some((key) => received[key] !== current[key])) fail('초안 또는 사이트가 바뀌었습니다. 다시 미리보기를 확인하세요.', 409);
}
function text(value, max, required = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value) || (required && !value.trim())) fail('입력 문구의 길이와 내용을 확인하세요.');
  return value.trim();
}
function link(value) {
  if (!value) return '';
  let u;
  try { u = new URL(text(value, 2048)); } catch { fail('영상 주소가 올바르지 않습니다.'); }
  // Only links, never server-fetch these user-supplied URLs.
  if (u.protocol !== 'https:' || u.username || u.password || !u.hostname.includes('.') || /^\d+\.\d+\.\d+\.\d+$/.test(u.hostname) || u.hostname.includes(':') || /\.(localhost|local|internal)$/i.test(u.hostname)) fail('공개 HTTPS 영상 주소를 입력하세요.');
  return u.href;
}
export function youtubeId(url) {
  if (!url) return undefined;
  const u = new URL(url);
  const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(u.hostname) ? (u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1]) : '';
  return /^[\w-]{11}$/.test(id || '') ? id : undefined;
}

export function publicPortfolio(items, owner = '') {
  if (!Array.isArray(items) || items.length > 500) fail('작업은 최대 500개까지 저장할 수 있습니다.');
  const ids = new Set(), ranks = new Set(), archive = [], cards = [], uploads = [];
  for (const item of items) {
    if (!item || !UUID.test(item.id) || ids.has(item.id) || typeof item.public !== 'boolean') fail('작업 ID 또는 공개 선택이 올바르지 않습니다.');
    ids.add(item.id);
    if (!item.public) continue;
    if (typeof item.archive !== 'boolean' || !Number.isInteger(item.rank) || item.rank < 0 || item.rank > 9) fail('전체 작업 표시와 대표작 순서를 확인하세요.');
    const name = text(item.name, 300, true), client = text(item.client, 200);
    if (!Number.isInteger(item.year) || item.year < 1900 || item.year > 2100) fail('작업 연도를 확인하세요.');
    if (!Array.isArray(item.platform) || !item.platform.length || item.platform.some((p) => !['Film', 'Live', 'Music', 'Web', 'Edit', 'Game', 'Filming'].includes(p))) fail('작업 분야를 선택하세요.');
    if (!Array.isArray(item.process) || item.process.length > 20) fail('작업 역할을 확인하세요.');
    const process = item.process.map((p) => text(p, 80, true));
    const url = link(item.url), recognition = text(item.recognition, 2000);
    if (item.archive) archive.push({ id: item.id, year: item.year, name, platform: [...new Set(item.platform)], process, client, ...(url && { url }), ...(recognition && { recognition }) });
    if (!item.rank) continue;
    if (ranks.has(item.rank)) fail('대표작 순서가 중복됩니다.');
    ranks.add(item.rank);
    const youtube = youtubeId(url);
    let image = text(item.image, 200);
    if (image && !/^\/images\/(?:work|portfolio)\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(image)) fail('사이트 이미지 경로가 올바르지 않습니다.');
    if (item.upload) {
      if (!UUID.test(owner) || !new RegExp(`^${owner}/[0-9a-f-]{36}\\.(jpg|png|webp)$`, 'i').test(item.upload)) fail('본인이 올린 이미지 파일만 사용할 수 있습니다.');
      uploads.push({ id: item.id, path: item.upload });
      image = '';
    }
    if (!image && !youtube && !item.upload) fail('대표작에는 이미지 또는 YouTube 영상이 필요합니다.');
    cards.push({ rank: item.rank, slug: item.id, title: text(item.title || name, 300, true), role: text(item.role, 300, true), year: text(item.displayYear || String(item.year), 40, true), client, note: text(item.note, 1000), ...(url && { url }), ...(youtube && !item.upload && { youtube }), ...(image && { image }) });
  }
  return { archive, featured: cards.sort((a, b) => a.rank - b.rank).map(({ rank, ...card }) => card), uploads };
}

export function imageType(bytes) {
  if (!bytes?.length || bytes.length > 8 * 1024 * 1024) fail('이미지는 8 MiB 이하만 올릴 수 있습니다.');
  const b = Buffer.from(bytes);
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  fail('JPG, PNG, WebP 이미지만 허용됩니다.');
}
