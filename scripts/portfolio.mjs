import { readFile, writeFile, mkdir, readdir, lstat, cp, copyFile, rename, unlink, open } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';
import { fetchPortfolio, downloadImage } from './notion-portfolio.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = ['src/data/archive.json', 'src/data/featured.ts'];
const SNAPSHOTS = 'tmp/portfolio-previews';
const MANAGED_IMAGE = /^public\/images\/notion\/[a-f0-9]{64}\.(jpg|png|webp)$/;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const featuredSource = (items) => `export type Featured = { slug: string; title: string; role: string; year: string; client: string; youtube?: string; image?: string; url?: string; note: string };\nexport const featured: Featured[] = ${json(items).trim()};\n`;

function snapshotPath(root, id) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id ?? '')) throw new Error('미리보기 번호가 올바르지 않습니다.');
  return join(root, SNAPSHOTS, id);
}

async function inventory(root) {
  const files = {};
  async function visit(name) {
    const path = join(root, name); const stat = await lstat(path);
    if (stat.isSymbolicLink()) throw new Error('사이트 폴더의 심볼릭 링크는 미리보기에 포함할 수 없습니다.');
    if (stat.isDirectory()) {
      for (const child of (await readdir(path)).sort()) await visit(`${name}/${child}`);
    } else if (stat.isFile()) files[name] = hash(await readFile(path));
  }
  for (const name of ['src', 'public', 'astro.config.mjs', 'package.json']) await visit(name);
  return files;
}

export async function createSnapshot(root, data, { fetcher = fetch, source = 'notion' } = {}) {
  root = resolve(root);
  const baseline = await inventory(root);
  const id = randomUUID(); const dir = snapshotPath(root, id); const site = join(dir, 'site');
  await mkdir(site, { recursive: true });
  for (const name of ['src', 'public', 'astro.config.mjs', 'package.json']) await cp(join(root, name), join(site, name), { recursive: true });
  const featured = structuredClone(data.featured);
  const images = [];
  for (const item of data.downloads ?? []) {
    const { bytes, extension } = await downloadImage(item.url, fetcher);
    const image = `/images/notion/${hash(bytes)}.${extension}`;
    await mkdir(join(site, 'public/images/notion'), { recursive: true });
    await writeFile(join(site, 'public', image), bytes);
    for (const card of featured) if (card.image === item.image) card.image = image;
    images.push(`public${image}`);
  }
  if (!data.archive?.length || !featured?.length || featured.length > 9) throw new Error('전체 작업·대표작 수를 확인하세요.');
  const referenced = new Set(featured.map((item) => `public${item.image}`));
  for (const name of Object.keys(baseline)) {
    if (MANAGED_IMAGE.test(name) && !referenced.has(name)) await unlink(join(site, name));
  }
  await writeFile(join(site, DATA[0]), json(data.archive));
  await writeFile(join(site, DATA[1]), featuredSource(featured));
  const layout = join(site, 'src/layouts/Base.astro');
  const html = await readFile(layout, 'utf8');
  await writeFile(layout, html.replace('</head>', '<meta name="robots" content="noindex, nofollow" /><meta name="referrer" content="no-referrer" /></head>').replace('<main id="main"', `<aside class="no-print" style="padding:12px 16px;background:var(--accent);color:var(--ink);font-size:14px">로컬 미리보기 · ${source === 'current' ? '기존 파일 사본 (노션 동기화 전)' : '공개 전'} · ${id}</aside><main id="main"`));
  if (json(await inventory(root)) !== json(baseline)) throw new Error('사본 생성 중 원본이 변경되었습니다. 다시 미리보기를 만드세요.');
  await writeFile(join(dir, 'manifest.json'), json({ id, source, createdAt: new Date().toISOString(), baseline, files: await inventory(site), images: [...new Set(images)], count: { archive: data.archive.length, featured: featured.length } }));
  return id;
}

export async function readSnapshot(root, id) {
  const dir = snapshotPath(root, id);
  let manifest;
  try { manifest = JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8')); } catch { throw new Error('완료된 미리보기가 없습니다. 새 미리보기를 만드세요.'); }
  if (manifest.id !== id || !manifest.files || !manifest.baseline || !Array.isArray(manifest.images)) throw new Error('미리보기 기록이 올바르지 않습니다.');
  if (json(await inventory(join(dir, 'site'))) !== json(manifest.files)) throw new Error('미리보기 파일이 변경되었습니다. 새 미리보기를 만드세요.');
  return manifest;
}

export async function applySnapshot(root, id) {
  snapshotPath(root, id);
  const lockPath = join(root, 'tmp/portfolio-apply.lock');
  await mkdir(dirname(lockPath), { recursive: true });
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('다른 공개용 반영이 실행 중입니다. 잠금 파일을 확인하세요.'); throw error; }
  try { return await applyUnlocked(root, id); }
  finally { await lock.close(); await unlink(lockPath); }
}

async function applyUnlocked(root, id) {
  const manifest = await readSnapshot(root, id);
  if (json(await inventory(root)) !== json(manifest.baseline)) throw new Error('미리보기 이후 원본이 변경되었습니다. 새 미리보기를 만드세요.');
  if (manifest.images.some((p) => !MANAGED_IMAGE.test(p))) throw new Error('미리보기 이미지 경로가 올바르지 않습니다.');
  const removed = Object.keys(manifest.baseline).filter((name) => MANAGED_IMAGE.test(name) && !manifest.files[name]);
  const dir = snapshotPath(root, id); const targets = [...new Set([...manifest.images, ...DATA, ...removed])];
  const originals = new Map(); const changed = [];
  // 준비·백업이 모두 끝난 뒤 공개용 파일을 교체한다. git/네트워크 동작 없음.
  for (const name of targets) {
    const path = join(root, name);
    let bytes;
    try { bytes = await readFile(path); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    originals.set(name, bytes);
    if (bytes) { const backup = join(dir, 'backup', name); await mkdir(dirname(backup), { recursive: true }); await writeFile(backup, bytes); }
  }
  if (json(await inventory(root)) !== json(manifest.baseline)) throw new Error('백업 중 원본이 변경되었습니다. 새 미리보기를 만드세요.');
  try {
    for (const name of targets) {
      const target = join(root, name); await mkdir(dirname(target), { recursive: true });
      const staged = join(dir, 'apply-staged');
      try {
        if (!removed.includes(name)) await copyFile(join(dir, 'site', name), staged);
        let current;
        try { current = await readFile(target); } catch (e) { if (e.code !== 'ENOENT') throw e; }
        if ((current ? hash(current) : undefined) !== manifest.baseline[name]) throw new Error('반영 중 원본이 변경되었습니다. 새 미리보기를 만드세요.');
        if (removed.includes(name)) await unlink(target); else await rename(staged, target);
        changed.push(name);
      }
      finally { await unlink(staged).catch((e) => { if (e.code !== 'ENOENT') throw e; }); }
    }
  } catch (error) {
    for (const name of changed.reverse()) {
      const bytes = originals.get(name);
      let current;
      try { current = await readFile(join(root, name)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      // 다른 편집자가 다시 저장했다면 그 편집까지 덮어쓰지 않는다. 원본은 backup/에 있다.
      if ((current ? hash(current) : undefined) === manifest.files[name]) {
        if (bytes) await writeFile(join(root, name), bytes); else await unlink(join(root, name));
      }
    }
    throw error;
  }
  return manifest.count;
}

async function main() {
  if (process.env.CI || process.env.VERCEL) throw new Error('포트폴리오 도구는 로컬 PC에서만 실행하세요.');
  const [command, option, id] = process.argv.slice(2);
  if (command === 'apply') {
    if (!option || id) throw new Error('반영할 미리보기 번호를 지정하세요: npm run portfolio:apply -- <번호>');
    const count = await applySnapshot(ROOT, option);
    console.log(`공개용 파일에 반영: 전체 작업 ${count.archive}, 대표작 ${count.featured}. 배포되지 않았습니다. build/check 후 commit/push는 별도 요청으로 진행하세요.`);
    return;
  }
  if (command !== 'preview' || (option && !['--current', '--snapshot'].includes(option)) || (option !== '--snapshot' && id)) throw new Error('사용법: portfolio:preview [-- --current | --snapshot <번호>]');
  let snapshotId = id;
  if (option !== '--snapshot') {
    let data;
    if (option === '--current') {
      const { featured } = await import(pathToFileURL(join(ROOT, DATA[1])).href);
      data = { archive: JSON.parse(await readFile(join(ROOT, DATA[0]), 'utf8')), featured, downloads: [] };
    } else {
      let settings = {};
      try { settings = parseEnv(await readFile(join(ROOT, '.env.notion.local'), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      const { featured } = await import(pathToFileURL(join(ROOT, DATA[1])).href);
      data = await fetchPortfolio({ token: process.env.NOTION_TOKEN || settings.NOTION_TOKEN, dataSourceId: process.env.NOTION_DATA_SOURCE_ID || settings.NOTION_DATA_SOURCE_ID, existingFeatured: featured });
    }
    snapshotId = await createSnapshot(ROOT, data, { source: option === '--current' ? 'current' : 'notion' });
  }
  const manifest = await readSnapshot(ROOT, snapshotId);
  console.log(`미리보기 번호: ${snapshotId}\n전체 작업 ${manifest.count.archive} · 대표작 ${manifest.count.featured}\n공개용 파일은 바뀌지 않았습니다. http://127.0.0.1:4322/`);
  for (const key of Object.keys(process.env)) if (key.startsWith('NOTION_')) delete process.env[key];
  const { dev } = await import('astro');
  const site = join(snapshotPath(ROOT, snapshotId), 'site');
  await dev({ root: site, server: { host: '127.0.0.1', port: 4322 }, vite: { server: { strictPort: true, fs: { strict: true, allow: [site, join(ROOT, 'node_modules')] } } } });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
