// 빌드 산출물 검사. 실패하면 exit 1.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const pages = ['index.html', 'work/index.html', 'intro/index.html', 'admin/index.html'];
const banned = ['pyu0205', 'Selene', 'once-ui', 'TODO', 'TBD'];
let fail = 0;
const err = (m) => { console.error('✗', m); fail++; };

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

if (!existsSync(DIST)) { err('dist 없음 — npm run build 먼저'); process.exit(1); }
const files = walk(DIST);
const htmls = files.filter((f) => f.endsWith('.html'));

for (const p of pages) if (!existsSync(join(DIST, p))) err(`페이지 없음: ${p}`);
if (existsSync(join(DIST, 'admin/index.html')) && !readFileSync(join(DIST, 'admin/index.html'), 'utf8').includes('content="noindex, nofollow"')) err('관리자 페이지 noindex 없음');
for (const f of files.filter((f) => /\.(html|js|json|css)$/.test(f))) {
  if (/sb_secret_|SUPABASE_SERVICE_ROLE_KEY|PORTFOLIO_GITHUB_TOKEN|CONFIDENTIAL_BROWSER_SENTINEL/.test(readFileSync(f, 'utf8'))) err(`${f}: 비밀 키 또는 비공개 테스트 표식이 공개 빌드에 포함됨`);
}

for (const h of htmls) {
  const html = readFileSync(h, 'utf8');
  for (const b of banned) if (html.includes(b)) err(`${h}: 금지 문자열 "${b}"`);
  if (!/<meta name="description" content="[^"]{10,}"/.test(html)) err(`${h}: description 없음`);
  for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
    if (!new RegExp(`<meta property="${property}" content="[^"]+"`).test(html)) err(`${h}: ${property} 없음`);
  }
  // 내부 링크·자산 존재 확인
  for (const m of html.matchAll(/(?:href|src|content)="(\/[^"#?]*)/g)) {
    const path = m[1] === '/' ? '/index.html' : m[1];
    const cands = [join(DIST, path), join(DIST, path, 'index.html')];
    if (!cands.some(existsSync)) err(`${h}: 깨진 내부 링크 ${m[1]}`);
  }
}
console.log(fail ? `${fail}개 문제` : `✓ ${htmls.length}개 페이지 통과`);
process.exit(fail ? 1 : 0);
