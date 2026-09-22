import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { convertPages, fetchPortfolio, downloadImage } from './notion-portfolio.mjs';
import { createSnapshot, applySnapshot, readSnapshot } from './portfolio.mjs';

const rich = (text) => ({ type: 'rich_text', rich_text: [{ plain_text: text }] });
const page = (n, { published = true, archive = true, rank = null, title = '작품', url = '', image = false } = {}) => ({
  object: 'page', id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  archived: false, in_trash: false,
  properties: {
    Name: { type: 'title', title: [{ plain_text: title }] }, Date: { type: 'number', number: 2023 },
    Client: rich('감독'), Platform: { type: 'multi_select', multi_select: [{ name: 'Flim' }] },
    Process: { type: 'multi_select', multi_select: [{ name: 'Mixing' }, { name: 'Foley' }] },
    '사이트 공개': { type: 'checkbox', checkbox: published }, '전체 작업 표시': { type: 'checkbox', checkbox: archive },
    '대표작 순서': { type: 'number', number: rank }, '영상 URL': { type: 'url', url: url || null },
    '한 줄 소개': rich('작업 설명'), '내부 메모': rich('PRIVATE_MEMO_MUST_NOT_ESCAPE'),
    '썸네일': { type: 'files', files: image ? [{ type: 'file', file: { url: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/image.jpg?secret=1' } }] : [] },
  },
});

test('공개 작품만 변환하고 묶음 대표작은 전체 작업 건수에 더하지 않는다', () => {
  const result = convertPages([page(1), page(2, { published: false, title: 'CONFIDENTIAL' }), page(3, { archive: false, rank: 1, url: 'https://youtu.be/G7P6u0izwsk' })]);
  assert.equal(result.archive.length, 1);
  assert.equal(result.archive[0].name, '작품');
  assert.deepEqual(result.archive[0].platform, ['Film']);
  assert.equal(result.featured[0].youtube, 'G7P6u0izwsk');
  assert.equal(result.featured[0].role, '믹싱 · 폴리');
  assert.doesNotMatch(JSON.stringify(result), /CONFIDENTIAL|PRIVATE_MEMO/);
});

test('대표작 중복 순서, 위험 URL, 중복 페이지, 잘못된 연도를 거부한다', () => {
  const a = page(1, { rank: 1, image: true });
  assert.throws(() => convertPages([a, page(2, { rank: 1, image: true })]), /순서/);
  assert.throws(() => convertPages([page(1, { url: 'javascript:alert(1)' })]), /URL/);
  assert.throws(() => convertPages([page(1, { url: 'https://user:password@example.com' })]), /URL/);
  assert.throws(() => convertPages([a, a]), /중복/);
  const bad = page(4); bad.properties.Date.number = null;
  assert.throws(() => convertPages([bad]), /연도/);
});

test('썸네일 임시 URL은 데이터에서 제거하고 다운로드 목록으로만 분리한다', () => {
  const result = convertPages([page(1, { rank: 1, image: true })]);
  assert.equal(result.downloads.length, 1);
  assert.match(result.featured[0].image, /^\/images\/notion\/[a-f0-9-]+\.jpg$/);
  assert.doesNotMatch(JSON.stringify([result.featured, result.archive]), /secret=|amazonaws/);
});

test('API에서 공개 필터를 적용하고 다음 페이지를 끝까지 읽는다', async () => {
  let calls = 0;
  const result = await fetchPortfolio({ token: 'test-token', dataSourceId: '00000000-0000-4000-8000-000000000000', fetcher: async (url, options) => {
    assert.match(url, /^https:\/\/api.notion.com\/v1\/data_sources\//);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    const body = JSON.parse(options.body);
    assert.deepEqual(body.filter, { property: '사이트 공개', checkbox: { equals: true } });
    calls++;
    if (calls === 1) return Response.json({ results: [page(1, { rank: 1, image: true })], has_more: true, next_cursor: 'next' });
    assert.equal(body.start_cursor, 'next');
    return Response.json({ results: [page(2)], has_more: false, next_cursor: null });
  } });
  assert.equal(result.archive.length, 2);
});

test('API 오류 내용에 토큰/비공개 이름이 있어도 출력용 오류에 싣지 않는다', async () => {
  await assert.rejects(fetchPortfolio({ token: 'secret-token', dataSourceId: '00000000-0000-4000-8000-000000000000', fetcher: async () => new Response('secret-token CONFIDENTIAL', { status: 403 }) }), (error) => {
    assert.match(error.message, /403/);
    assert.doesNotMatch(error.message, /secret-token|CONFIDENTIAL/); return true;
  });
});

test('다운로드는 내부 주소, 리다이렉트, HTML 위장 이미지를 거부한다', async () => {
  await assert.rejects(downloadImage('http://127.0.0.1/private'), /이미지/);
  await assert.rejects(downloadImage('https://example.com/a.jpg'), /이미지/);
  await assert.rejects(downloadImage('https://s3.us-west-2.amazonaws.com/a.jpg', async () => new Response('', { status: 302 })), /이미지/);
  await assert.rejects(downloadImage('https://s3.us-west-2.amazonaws.com/a.jpg', async () => new Response('<html>private</html>', { headers: { 'content-type': 'image/jpeg' } })), /이미지/);
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'unifolio-test-'));
  await mkdir(join(root, 'src/data'), { recursive: true });
  await mkdir(join(root, 'src/layouts'), { recursive: true });
  await mkdir(join(root, 'public/images/work'), { recursive: true });
  await writeFile(join(root, 'src/data/featured.ts'), 'export const featured = [];');
  await writeFile(join(root, 'src/data/archive.json'), '[{"name":"original"}]');
  await writeFile(join(root, 'src/layouts/Base.astro'), '<html><head></head><body><main id="main"></main></body></html>');
  await writeFile(join(root, 'public/images/work/existing.jpg'), 'old-image');
  await writeFile(join(root, 'astro.config.mjs'), 'export default {};');
  await writeFile(join(root, 'package.json'), '{"type":"module"}');
  await writeFile(join(root, '.env.notion.local'), 'NOTION_TOKEN=PRIVATE_TOKEN');
  return root;
}
const data = () => convertPages([page(1, { rank: 1, url: 'https://youtu.be/G7P6u0izwsk', title: 'LOCAL_SECRET_SENTINEL' })]);

test('사본만 바꾸며 토큰 파일은 복사하지 않고 검토한 데이터만 명시적으로 반영한다', async () => {
  const root = await fixture();
  const id = await createSnapshot(root, data());
  assert.equal(await readFile(join(root, 'src/data/archive.json'), 'utf8'), '[{"name":"original"}]');
  const snapshot = await readSnapshot(root, id);
  assert.doesNotMatch(JSON.stringify(snapshot), /PRIVATE_TOKEN/);
  assert.ok(!(await readdir(join(root, 'tmp/portfolio-previews', id, 'site'))).includes('.env.notion.local'));
  await applySnapshot(root, id);
  assert.equal(JSON.parse(await readFile(join(root, 'src/data/archive.json'), 'utf8'))[0].name, 'LOCAL_SECRET_SENTINEL');
  assert.equal(await readFile(join(root, 'public/images/work/existing.jpg'), 'utf8'), 'old-image');
});

test('미리보기 이후 원본 편집이나 사본 변조가 있으면 apply는 아무것도 바꾸지 않는다', async () => {
  const root = await fixture(); const id = await createSnapshot(root, data());
  await writeFile(join(root, 'src/data/archive.json'), '[{"name":"new edit"}]');
  await assert.rejects(applySnapshot(root, id), /변경/);
  assert.equal(await readFile(join(root, 'src/data/archive.json'), 'utf8'), '[{"name":"new edit"}]');
  const fresh = await fixture(); const sid = await createSnapshot(fresh, data());
  await writeFile(join(fresh, 'tmp/portfolio-previews', sid, 'site/src/data/archive.json'), '[]');
  await assert.rejects(applySnapshot(fresh, sid), /변경/);
  assert.equal(await readFile(join(fresh, 'src/data/archive.json'), 'utf8'), '[{"name":"original"}]');
  await assert.rejects(applySnapshot(fresh, '../outside'), /번호/);
});

test('이미지 실패 시 완료 사본을 만들지 않고 공개 파일을 보존한다', async () => {
  const root = await fixture();
  await assert.rejects(createSnapshot(root, convertPages([page(1, { rank: 1, image: true })]), { fetcher: async () => new Response('bad', { status: 404 }) }), /이미지/);
  assert.equal(await readFile(join(root, 'src/data/archive.json'), 'utf8'), '[{"name":"original"}]');
  const folders = await readdir(join(root, 'tmp/portfolio-previews'));
  for (const folder of folders) await assert.rejects(readSnapshot(root, folder));
});

test('이전에 반영한 미사용 이미지는 로컬 백업에 남기고 공개 경로에서 제거한다', async () => {
  const root = await fixture();
  const old = 'public/images/notion/' + 'a'.repeat(64) + '.jpg';
  await mkdir(join(root, 'public/images/notion'), { recursive: true });
  await writeFile(join(root, old), 'previously published image');
  const id = await createSnapshot(root, data());
  await assert.rejects(readFile(join(root, 'tmp/portfolio-previews', id, 'site', old)), { code: 'ENOENT' });
  await applySnapshot(root, id);
  await assert.rejects(readFile(join(root, old)), { code: 'ENOENT' });
  assert.equal(await readFile(join(root, 'tmp/portfolio-previews', id, 'backup', old), 'utf8'), 'previously published image');
});

test('다른 apply 실행의 잠금이 있으면 파일을 변경하지 않는다', async () => {
  const root = await fixture(); const id = await createSnapshot(root, data());
  const lock = await open(join(root, 'tmp/portfolio-apply.lock'), 'wx');
  try {
    await assert.rejects(applySnapshot(root, id), /실행 중/);
    assert.equal(await readFile(join(root, 'src/data/archive.json'), 'utf8'), '[{"name":"original"}]');
  } finally { await lock.close(); }
});

test('기존 작품 ID가 일치할 때만 기존 포스터를 유지하고 표시용 클라이언트를 쓴다', () => {
  const item = page(1, { rank: 1 });
  item.properties['사이트 클라이언트 표기'] = rich('기존 표시명');
  const fallback = [{ notionId: item.id, image: '/images/work/known.jpg' }];
  const result = convertPages([item], fallback);
  assert.equal(result.featured[0].image, '/images/work/known.jpg');
  assert.equal(result.featured[0].client, '기존 표시명');
  assert.equal(result.archive[0].client, '기존 표시명');
  assert.throws(() => convertPages([page(2, { rank: 1 })], fallback), /썸네일/);
});

test('정상 이미지를 로컬 파일로 저장하고 서명 URL 없이 해당 사본을 반영한다', async () => {
  const root = await fixture();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
  const id = await createSnapshot(root, convertPages([page(1, { rank: 1, image: true })]), { fetcher: async () => new Response(png, { headers: { 'content-type': 'image/png' } }) });
  const record = await readSnapshot(root, id);
  assert.match(record.images[0], /^public\/images\/notion\/[a-f0-9]{64}\.png$/);
  assert.doesNotMatch(await readFile(join(root, 'tmp/portfolio-previews', id, 'site/src/data/featured.ts'), 'utf8'), /secret=|amazonaws/);
  await applySnapshot(root, id);
  assert.deepEqual(await readFile(join(root, record.images[0])), png);
});

test('기존 아카이브의 클라이언트·역할 공란은 그대로 보존한다', () => {
  const old = page(1); old.properties.Client = rich(''); old.properties.Process.multi_select = [];
  const result = convertPages([old, page(2, { rank: 1, image: true })]);
  assert.equal(result.archive[0].client, '');
  assert.deepEqual(result.archive[0].process, []);
});
