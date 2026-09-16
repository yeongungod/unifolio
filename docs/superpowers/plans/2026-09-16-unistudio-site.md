# 우니스튜디오 사이트 + 소개서 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** yeongungod.com을 우니스튜디오 원페이지 사이트(+ 아카이브 표 + 인쇄용 소개서)로 갈아엎고 Vercel에 배포한다.

**Architecture:** Astro 정적 사이트. 내용은 `src/data/` 세 파일(site.ts · featured.ts · archive.json)에만 있고, 컴포넌트는 그걸 읽어 그린다. 서버 코드 없음. `/intro`는 같은 데이터로 A4 한 장을 그리고, 헤드리스 크롬으로 PDF를 뽑아 `G:\91_uniStudio\소개서\`에 저장한다.

**Tech Stack:** Astro 5 · TypeScript · 순수 CSS(토큰 4색) · SUITE 웹폰트(ttf) · Vercel(GitHub 연동, 이미 연결됨) · Python(PIL, 이미지 리사이즈·OG 생성) · Chrome headless(PDF)

## Global Constraints

- 저장소 `C:\Users\yeongungod\Documents\GitHub\unifolio`, 브랜치 `rebuild-astro`. main은 마지막 태스크에서만 합친다
- 색은 이 넷만: Ink `#141210` · Accent `#9CC3D5` · Paper `#FBF9F6` · Muted `#8A837C`. 배경은 Ink, 글자는 Paper
- 서체 SUITE만. 파일은 `C:\Windows\Fonts\SUITE-{Medium,SemiBold,Bold}.ttf`
- 연락처: `unistudio@yeongungod.com` · `010-5925-6367`. 개인 메일(pyu0205)은 어디에도 넣지 않는다
- 사업자 정보: 우니스튜디오 · 대표 박영운 · 사업자번호 898-11-03021 · 경기도 양평군 용문면 용문로371번길 6, 202호
- 히어로 문구: 「영상 편집과 사운드를 한 곳에서.」 / 「유튜브 롱폼·쇼츠 편집, 영화·웹콘텐츠 믹싱. 2019년부터 100건 이상.」
- 단가·가격 표기 금지. 문의 폼·카카오·영문판·블로그 없음
- 모든 파일 UTF-8. 커밋 메시지 끝에 아래 두 줄:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa
  ```
- 검증은 매 태스크 `npm run build` + `node scripts/check.mjs`(Task 1에서 만듦)

---

## File Structure

| 파일 | 책임 |
|---|---|
| `package.json` · `astro.config.mjs` · `tsconfig.json` | Astro 프로젝트 뼈대. 의존성은 `astro` 하나 |
| `public/fonts/SUITE-*.ttf` | 웹폰트 |
| `public/favicon.svg` · `public/og.png` | 파비콘(마크) · 링크 미리보기 1200×630 |
| `public/images/work/*.jpg` | 유튜브 없는 대표작 썸네일 (1280px 폭) |
| `src/styles/global.css` | 색 토큰 · @font-face · 기본 타이포 · 인쇄 규칙 |
| `src/data/site.ts` | 상호·연락처·사업자·하는 일·진행 방식·대표 약력·수상·툴·히어로 문구 |
| `src/data/featured.ts` | 대표작 8건 |
| `src/data/archive.json` | 노션 내보내기 117건 |
| `src/layouts/Base.astro` | `<head>`(메타·OG·파비콘·폰트) · 상단 메뉴 · 푸터 |
| `src/components/Hero.astro` | 섹션 1 |
| `src/components/VideoCard.astro` | 카드 1장: 썸네일 → 클릭 시 iframe |
| `src/components/WorkGrid.astro` | 섹션 2: featured 8건 그리드 |
| `src/components/Services.astro` | 섹션 3+4: 하는 일 · 진행 방식 |
| `src/components/About.astro` | 섹션 5: 스튜디오·대표 |
| `src/components/Contact.astro` | 섹션 6+7: 전체 작업 링크 · 문의 · 사업자 정보 |
| `src/components/ArchiveTable.astro` | `/work` 표 + 필터 |
| `src/pages/index.astro` · `work.astro` · `intro.astro` | 페이지 3개 |
| `scripts/check.mjs` | 빌드 산출물 검사(페이지 존재·내부 링크·금지 문자열) |
| `scripts/make-og.py` · `scripts/make-pdf.mjs` | OG 이미지 생성 · 소개서 PDF 생성 |

---

### Task 1: 저장소 비우기 + Astro 뼈대 + 검사 스크립트

**Files:**
- Delete: `src/`, `public/`, `.github/`, `biome.json`, `postcss.config.js`, `.eslintrc.json`, `.env.example`, `LICENSE`, `README.md`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`(임시), `public/fonts/SUITE-Medium.ttf` · `SUITE-SemiBold.ttf` · `SUITE-Bold.ttf`, `public/favicon.svg`, `scripts/check.mjs`, `README.md`

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; bodyClass?: string }` — 모든 페이지가 이걸로 감싼다. CSS 변수 `--ink --accent --paper --muted`, 클래스 `.wrap`(max-width 1080px, 좌우 16px), `.accent-bar`(아쿠아마린 가로선), `.label`(작은 대문자 라벨)

- [ ] **Step 1: 기존 템플릿 삭제**

```bash
cd /c/Users/yeongungod/Documents/GitHub/unifolio
git rm -rq src public .github biome.json postcss.config.js .eslintrc.json .env.example LICENSE README.md package-lock.json next.config.mjs tsconfig.json package.json
rm -rf node_modules .next
git status --short | head
```
Expected: 삭제 목록만 보이고 `docs/`는 남아 있음.

- [ ] **Step 2: package.json · astro.config.mjs · tsconfig.json · .gitignore 작성**

`package.json`
```json
{
  "name": "unistudio-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "node scripts/check.mjs",
    "pdf": "node scripts/make-pdf.mjs"
  },
  "dependencies": {
    "astro": "^5.13.0"
  }
}
```

`astro.config.mjs`
```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://yeongungod.com',
  output: 'static',
  build: { format: 'directory' },
});
```

`tsconfig.json`
```json
{ "extends": "astro/tsconfigs/strict" }
```

`.gitignore`
```
node_modules/
dist/
.astro/
.superpowers/
.vercel/
.DS_Store
```

- [ ] **Step 3: 설치 및 빈 빌드 확인**

```bash
npm install
```
Expected: `astro@5.x` 설치, 에러 없음.

- [ ] **Step 4: 폰트·파비콘 복사**

```bash
mkdir -p public/fonts public/images/work
cp /c/Windows/Fonts/SUITE-Medium.ttf /c/Windows/Fonts/SUITE-SemiBold.ttf /c/Windows/Fonts/SUITE-Bold.ttf public/fonts/
cp "/g/91_uniStudio/브랜드/logo/unistudio-mark-white.svg" public/favicon.svg
ls -la public/fonts public/favicon.svg
```
Expected: ttf 3개(각 1~3MB), favicon.svg.

- [ ] **Step 5: global.css**

`src/styles/global.css`
```css
@font-face { font-family: 'SUITE'; src: url('/fonts/SUITE-Medium.ttf') format('truetype'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'SUITE'; src: url('/fonts/SUITE-SemiBold.ttf') format('truetype'); font-weight: 600; font-display: swap; }
@font-face { font-family: 'SUITE'; src: url('/fonts/SUITE-Bold.ttf') format('truetype'); font-weight: 700; font-display: swap; }

:root {
  --ink: #141210;
  --accent: #9CC3D5;
  --paper: #FBF9F6;
  --muted: #8A837C;
  --line: rgba(251, 249, 246, 0.12);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--ink);
  color: var(--paper);
  font-family: 'SUITE', 'Pretendard', 'Malgun Gothic', sans-serif;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
h1, h2, h3 { margin: 0; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; }
h1 { font-size: clamp(32px, 6vw, 56px); }
h2 { font-size: clamp(22px, 3.5vw, 30px); }
h3 { font-size: 17px; }
p { margin: 0; }

.wrap { max-width: 1080px; margin: 0 auto; padding: 0 16px; }
section { padding: 72px 0; border-top: 1px solid var(--line); }
.label { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
.muted { color: var(--muted); }
.accent-bar { width: 56px; height: 3px; background: var(--accent); margin: 20px 0; }
.btn {
  display: inline-block; padding: 12px 20px; border: 1px solid var(--paper);
  border-radius: 4px; font-weight: 600; font-size: 15px;
}
.btn:hover { background: var(--paper); color: var(--ink); }
.btn.accent { background: var(--accent); border-color: var(--accent); color: var(--ink); }
.grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

@media (max-width: 600px) {
  section { padding: 48px 0; }
}
```

- [ ] **Step 6: Base.astro**

`src/layouts/Base.astro`
```astro
---
import '../styles/global.css';
import { site } from '../data/site';
interface Props { title: string; description: string; bodyClass?: string }
const { title, description, bodyClass = '' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={new URL('/og.png', Astro.site)} />
  <meta name="twitter:card" content="summary_large_image" />
</head>
<body class={bodyClass}>
  <header class="site-header">
    <div class="wrap row">
      <a href="/" class="logo" aria-label="uniStudio 홈">
        <svg width="26" height="23" viewBox="0 0 133.8 120" aria-hidden="true"><g transform="scale(1.53846)"><g transform="translate(7.5,-11)" fill="none" stroke-width="15" stroke-linecap="round"><path d="M0 38.5V61.5M48 31.5V68.5M72 25.5V74.5" stroke="#FBF9F6"/><path d="M24 18.5V81.5" stroke="#9CC3D5"/></g></g></svg>
        <span>uniStudio</span>
      </a>
      <nav>
        <a href="/#work">작업</a>
        <a href="/#studio">스튜디오</a>
        <a href="/work">전체 작업</a>
        <a href="/#contact">문의</a>
      </nav>
    </div>
  </header>
  <main><slot /></main>
  <footer class="site-footer">
    <div class="wrap">
      <p class="muted">© {new Date().getFullYear()} {site.name} · {site.owner} · 사업자등록번호 {site.bizNo}</p>
    </div>
  </footer>
</body>
</html>

<style>
  .site-header { position: sticky; top: 0; z-index: 10; background: rgba(20,18,16,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
  .row { display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; }
  nav { display: flex; gap: 20px; font-size: 14px; font-weight: 600; }
  nav a { opacity: 0.8; }
  nav a:hover { opacity: 1; color: var(--accent); }
  .site-footer { border-top: 1px solid var(--line); padding: 32px 0; font-size: 13px; }
  @media (max-width: 600px) { nav { gap: 12px; font-size: 13px; } .logo span { display: none; } }
</style>
```

- [ ] **Step 7: 임시 site.ts와 index.astro (빌드 통과용 최소)**

`src/data/site.ts`(Task 2에서 채움. 지금은 푸터가 쓰는 세 필드만)
```ts
export const site = {
  name: '우니스튜디오',
  owner: '박영운',
  bizNo: '898-11-03021',
};
```

`src/pages/index.astro`
```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="우니스튜디오 — 영상 편집 · 사운드" description="유튜브 롱폼·쇼츠 편집, 영화·웹콘텐츠 믹싱.">
  <section><div class="wrap"><h1>영상 편집과 사운드를 한 곳에서.</h1></div></section>
</Base>
```

- [ ] **Step 8: 검사 스크립트**

`scripts/check.mjs`
```js
// 빌드 산출물 검사. 실패하면 exit 1.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const pages = ['index.html', 'work/index.html', 'intro/index.html'];
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

for (const h of htmls) {
  const html = readFileSync(h, 'utf8');
  for (const b of banned) if (html.includes(b)) err(`${h}: 금지 문자열 "${b}"`);
  if (!/<meta name="description" content="[^"]{10,}"/.test(html)) err(`${h}: description 없음`);
  // 내부 링크·자산 존재 확인
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const path = m[1] === '/' ? '/index.html' : m[1];
    const cands = [join(DIST, path), join(DIST, path, 'index.html')];
    if (!cands.some(existsSync)) err(`${h}: 깨진 내부 링크 ${m[1]}`);
  }
}
console.log(fail ? `${fail}개 문제` : `✓ ${htmls.length}개 페이지 통과`);
process.exit(fail ? 1 : 0);
```

이 시점엔 `/work`·`/intro`가 아직 없어 두 줄 실패가 정상이다. Task 4·5에서 사라진다.

- [ ] **Step 9: 빌드 확인**

```bash
npm run build && node scripts/check.mjs
```
Expected: 빌드 성공. check는 「페이지 없음: work/index.html」「페이지 없음: intro/index.html」 2개만.

- [ ] **Step 10: README·커밋**

`README.md`
```md
# uniStudio — yeongungod.com

Astro 정적 사이트. 내용은 `src/data/` 세 파일만 고치면 된다.

- `site.ts` 연락처·하는 일·약력 · `featured.ts` 대표작 8건 · `archive.json` 전체 작업(노션 내보내기)
- `npm run dev` 로컬 · `npm run build && npm run check` 검증 · `npm run pdf` 소개서 PDF → `G:\91_uniStudio\소개서\`
- main에 push하면 Vercel이 배포한다. 설계는 `docs/superpowers/specs/`.
```

```bash
git add -A && git commit -q -m "chore: Astro 뼈대 — 템플릿 제거, 토큰·서체·레이아웃·검사 스크립트

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 2: 데이터 파일 3개 + 대표작 이미지

**Files:**
- Create: `src/data/site.ts`(교체), `src/data/featured.ts`, `src/data/archive.json`, `public/images/work/{haebojaseries,soulmate,chimmuk,saraji,navy,kazan,onside,tfd}.jpg`
- Source: `C:\Users\yeongungod\.claude\jobs\5205fbd7\tmp\archive.json`, `...\tmp\work-img\{chimmuk.webp,saraji.png,soulmate.png,onside-immacho.jpg}`

**Interfaces:**
- Produces:
  ```ts
  // site.ts
  export const site: { name; nameEn; owner; bizNo; email; phone; address; hero: { title; sub }; services: {title; desc}[]; process: string[]; about: { intro; edu; awards: {year; title; body}[]; tools: string[] }; };
  // featured.ts
  export type Featured = { slug: string; title: string; role: string; year: string; client: string; youtube?: string; image?: string; note: string };
  export const featured: Featured[];
  // archive.json
  type Row = { year: number; name: string; platform: ('Film'|'Live'|'Music'|'Web'|'Edit'|'Game')[]; process: string[]; client: string };
  ```

- [ ] **Step 1: site.ts**

```ts
export const site = {
  name: '우니스튜디오',
  nameEn: 'uniStudio',
  owner: '박영운',
  bizNo: '898-11-03021',
  email: 'unistudio@yeongungod.com',
  phone: '010-5925-6367',
  phoneHref: 'tel:+821059256367',
  address: '경기도 양평군 용문면 용문로371번길 6, 202호',
  hero: {
    title: '영상 편집과 사운드를 한 곳에서.',
    sub: '유튜브 롱폼·쇼츠 편집, 영화·웹콘텐츠 믹싱. 2019년부터 100건 이상.',
  },
  services: [
    { title: '유튜브 롱폼·쇼츠 편집', desc: '라이브 원본에서 본편과 쇼츠까지. 풀자막·밈·썸네일 문구 포함.' },
    { title: '영화·웹콘텐츠 믹싱·사운드디자인', desc: 'ADR·폴리·사운드디자인·마스터링. 영화제 출품 규격 대응.' },
    { title: '음악 녹음·믹싱·마스터링', desc: '라이브 클립, 커버곡, 싱글.' },
    { title: '라이브 PA', desc: '팬미팅·콘서트·행사 현장 음향.' },
  ],
  process: ['문의', '견적', '작업', '납품'],
  processNote: '일반과세 사업자라 세금계산서 발행이 됩니다. 견적은 작업 범위를 듣고 드립니다.',
  about: {
    intro: '서울예술대학교 방송영상과에서 음향을 전공했고, 2019년부터 영화·웹콘텐츠·라이브·음악 사운드를 해왔습니다. 2025년부터 유튜브 편집을 함께 하고, 2026년 9월 우니스튜디오를 열었습니다.',
    edu: '서울예술대학교 방송영상과 음향 전공 (2019–2024)',
    awards: [
      { year: '2024.12', title: '제24회 대한민국국제청소년영화제', body: '「날치」 작품상 대학부 은상' },
      { year: '2023.12', title: '서울아트비디오페스티벌', body: '「살아지다」 음향상' },
      { year: '2023.11', title: '제18회 대한민국대학영화제', body: '「침묵」 최우수작품상 · 여자연기상' },
      { year: '2023.08', title: '제1회 싸이파이안페스타', body: '「PD님이 책임지세요」 관객상' },
      { year: '2021.10', title: '제6회 충무로영화제', body: '「목화토금수」 올해의 각본상' },
      { year: '2021.05', title: '대한민국 육군 아미로그 공모전', body: '최우수상' },
      { year: '2020.01', title: '주식회사 아론 이어폰 광고 공모전', body: '동상' },
    ],
    tools: ['Premiere Pro', 'Pro Tools', 'Vrew', 'After Effects', 'Photoshop', 'Cubase', 'iZotope', 'Waves', 'UAD'],
    certs: ['Pro Tools 101 · 110 (Avid)', 'ACA Premiere · Illustrator (Adobe)'],
  },
};
```

- [ ] **Step 2: featured.ts**

```ts
export type Featured = {
  slug: string; title: string; role: string; year: string; client: string;
  youtube?: string;   // 유튜브 영상 ID. 있으면 클릭 시 재생
  image?: string;     // youtube 없을 때 /images/work/ 경로
  note: string;
};

export const featured: Featured[] = [
  { slug: 'haebojaseries', title: '해보자시리즈', role: '유튜브 롱폼·쇼츠 편집', year: '2025 –', client: '해보자시리즈', youtube: 'G7P6u0izwsk', note: '구독자 15만 게임 채널. 롱폼·쇼츠 편집, 썸네일 문구까지.' },
  { slug: 'soulmate', title: '나의 소울메이트', role: '믹싱 · 사운드디자인 · ADR · 폴리 · 마스터링', year: '2025', client: '이채범 감독', image: '/images/work/soulmate.jpg', note: '단편영화 사운드 전 공정.' },
  { slug: 'chimmuk', title: '침묵', role: '믹싱 · 사운드디자인 · 폴리 · 마스터링', year: '2022', client: '배준원 감독', image: '/images/work/chimmuk.jpg', note: '제18회 대한민국대학영화제 최우수작품상 · 여자연기상. 인디스토리 배급.' },
  { slug: 'saraji', title: '살아지다', role: '믹싱 · 사운드디자인 · ADR · 폴리 · 녹음 · 마스터링', year: '2023', client: '정도영 감독', image: '/images/work/saraji.jpg', note: '서울아트비디오페스티벌 음향상.' },
  { slug: 'navy', title: '대한민국 해군 · 공군 웹콘텐츠', role: '믹싱 · 사운드디자인 · 마스터링', year: '2023 – 25', client: '대한민국 해군 · 공군', youtube: '4j_y34frjNU', note: '창설 기념 광고, 훈련소 다큐, 정신전력 교육 영상 등 7건.' },
  { slug: 'kazan', title: '퍼스트 버서커: 카잔 | 전설을 만들다', role: '녹음 · 사운드 어시스트', year: '2025', client: 'NEXON', youtube: 'TbFCH78wKlc', note: '게임 출시 웹콘텐츠 현장 녹음.' },
  { slug: 'onside', title: '온사이드 팬미팅 시리즈', role: '라이브 PA', year: '2023 – 25', client: 'ONSIDE COMPANY', image: '/images/work/onside.jpg', note: '마젠타·수련수련·임마초·최솜이 등 팬미팅·콘서트 9회 현장 음향.' },
  { slug: 'tfd', title: 'The First Descendant — UI 사운드', role: '사운드디자인 데모', year: '2025', client: '개인 작업', youtube: 'WKvy_jR7frU', note: 'Sci-Fi UI 효과음 재해석. 개인 포트폴리오 영상.' },
];
```

- [ ] **Step 3: archive.json 복사**

```bash
cp "/c/Users/yeongungod/.claude/jobs/5205fbd7/tmp/archive.json" src/data/archive.json
node -e "const a=require('./src/data/archive.json');console.log(a.length, a[0])"
```
Expected: `117 { year: 2025, name: 'The First Descendant - UI Sound Design', ... }`

- [ ] **Step 4: 이미지 4장 → 1280px jpg**

`scripts/resize-work.py` (한 번 쓰고 남겨둔다)
```python
# -*- coding: utf-8 -*-
# tmp/work-img 원본 → public/images/work/*.jpg (폭 1280, 16:9 중앙 크롭)
from PIL import Image
import os
SRC = r'C:\Users\yeongungod\.claude\jobs\5205fbd7\tmp\work-img'
DST = r'public\images\work'
JOBS = {'chimmuk.webp':'chimmuk.jpg','saraji.png':'saraji.jpg','soulmate.png':'soulmate.jpg','onside-immacho.jpg':'onside.jpg'}
for s, d in JOBS.items():
    im = Image.open(os.path.join(SRC, s)).convert('RGB')
    w, h = im.size
    tw, th = w, int(w * 9 / 16)
    if th > h:  # 너무 세로가 짧으면 폭을 줄인다
        th, tw = h, int(h * 16 / 9)
    box = ((w - tw) // 2, (h - th) // 2, (w + tw) // 2, (h + th) // 2)
    im = im.crop(box).resize((1280, 720), Image.LANCZOS)
    im.save(os.path.join(DST, d), quality=82, optimize=True)
    print(d, os.path.getsize(os.path.join(DST, d)) // 1024, 'KB')
```
```bash
PYTHONUTF8=1 python scripts/resize-work.py
```
Expected: 4개 jpg, 각 100~250KB. 세로 포스터(침묵·온사이드)는 중앙 크롭돼 얼굴/제목이 잘리면 `box`를 위쪽으로 옮겨 다시 뽑는다 — 눈으로 확인할 것.

- [ ] **Step 5: 빌드·커밋**

```bash
npm run build && node scripts/check.mjs; git add -A && git commit -q -m "feat: 데이터 파일(site·featured·archive 117건) + 대표작 썸네일 4장

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 3: 홈 원페이지 (섹션 7개)

**Files:**
- Create: `src/components/Hero.astro`, `VideoCard.astro`, `WorkGrid.astro`, `Services.astro`, `About.astro`, `Contact.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site`, `featured` (Task 2)
- Produces: `VideoCard` props `{ item: Featured; compact?: boolean }` — `/intro`에서도 재사용

- [ ] **Step 1: Hero.astro**

```astro
---
import { site } from '../data/site';
---
<section class="hero" id="top">
  <div class="wrap">
    <p class="label">{site.nameEn} · 양평</p>
    <h1>{site.hero.title}</h1>
    <p class="sub">{site.hero.sub}</p>
    <div class="accent-bar"></div>
    <div class="cta">
      <a class="btn accent" href={`mailto:${site.email}`}>메일로 문의</a>
      <a class="btn" href="#work">작업 보기</a>
    </div>
  </div>
</section>
<style>
  .hero { border-top: 0; padding: 96px 0 72px; }
  h1 { max-width: 14ch; }
  .sub { margin-top: 18px; font-size: 18px; color: var(--muted); max-width: 40ch; }
  .cta { display: flex; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 600px) { .hero { padding: 64px 0 48px; } .sub { font-size: 16px; } }
</style>
```

- [ ] **Step 2: VideoCard.astro** — 썸네일만 싣고, 클릭 시 iframe으로 교체

```astro
---
import type { Featured } from '../data/featured';
interface Props { item: Featured; compact?: boolean }
const { item, compact = false } = Astro.props;
const thumb = item.youtube ? `https://i.ytimg.com/vi/${item.youtube}/hqdefault.jpg` : item.image;
---
<article class:list={['card', { compact }]}>
  {item.youtube ? (
    <button class="media yt" data-id={item.youtube} aria-label={`${item.title} 재생`}>
      <img src={thumb} alt="" loading="lazy" width="480" height="360" />
      <span class="play" aria-hidden="true">▶</span>
    </button>
  ) : (
    <div class="media"><img src={thumb} alt="" loading="lazy" width="1280" height="720" /></div>
  )}
  <div class="body">
    <p class="label">{item.year} · {item.client}</p>
    <h3>{item.title}</h3>
    <p class="role">{item.role}</p>
    {!compact && <p class="note muted">{item.note}</p>}
  </div>
</article>

<style>
  .card { display: flex; flex-direction: column; gap: 12px; }
  .media { position: relative; aspect-ratio: 16/9; overflow: hidden; border-radius: 6px; background: #26231f; padding: 0; border: 0; width: 100%; cursor: pointer; }
  .media img { width: 100%; height: 100%; object-fit: cover; }
  .play { position: absolute; inset: 0; display: grid; place-items: center; color: var(--paper); font-size: 28px; background: rgba(20,18,16,0.25); transition: background .15s; }
  .yt:hover .play { background: rgba(156,195,213,0.35); }
  .media iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .role { font-size: 14px; color: var(--accent); margin-top: 4px; }
  .note { font-size: 14px; margin-top: 6px; }
  .compact .note { display: none; }
</style>

<script>
  // 클릭한 카드만 iframe으로 교체 — 페이지 로드 시 유튜브 스크립트 0
  document.querySelectorAll<HTMLButtonElement>('.yt').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      f.title = b.getAttribute('aria-label') ?? '';
      b.replaceChildren(f);
    }, { once: true });
  });
</script>
```

- [ ] **Step 3: WorkGrid.astro**

```astro
---
import { featured } from '../data/featured';
import VideoCard from './VideoCard.astro';
---
<section id="work">
  <div class="wrap">
    <p class="label">Selected work</p>
    <h2>대표작</h2>
    <div class="grid" style="margin-top:28px">
      {featured.map((item) => <VideoCard item={item} />)}
    </div>
    <p style="margin-top:28px"><a class="btn" href="/work">전체 작업 117건 보기 →</a></p>
  </div>
</section>
```

- [ ] **Step 4: Services.astro** (하는 일 + 진행 방식)

```astro
---
import { site } from '../data/site';
---
<section id="services">
  <div class="wrap">
    <p class="label">Services</p>
    <h2>하는 일</h2>
    <ul class="services">
      {site.services.map((s) => (
        <li><h3>{s.title}</h3><p class="muted">{s.desc}</p></li>
      ))}
    </ul>
    <p class="label" style="margin-top:56px">Process</p>
    <ol class="process">
      {site.process.map((p, i) => <li><span class="n">{i + 1}</span>{p}</li>)}
    </ol>
    <p class="muted" style="margin-top:14px;font-size:14px">{site.processNote}</p>
  </div>
</section>
<style>
  .services { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  .services li { border-top: 1px solid var(--line); padding-top: 14px; }
  .services p { margin-top: 6px; font-size: 14px; }
  .process { list-style: none; padding: 0; margin: 16px 0 0; display: flex; gap: 12px; flex-wrap: wrap; font-weight: 600; }
  .process li { display: flex; align-items: center; gap: 8px; }
  .process li + li::before { content: '→'; color: var(--muted); margin-right: 4px; }
  .n { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: var(--ink); font-size: 12px; }
</style>
```

- [ ] **Step 5: About.astro**

```astro
---
import { site } from '../data/site';
const a = site.about;
---
<section id="studio">
  <div class="wrap">
    <p class="label">Studio</p>
    <h2>{site.name} · 대표 {site.owner}</h2>
    <p class="intro">{a.intro}</p>
    <div class="cols">
      <div>
        <h3>수상</h3>
        <ul class="awards">
          {a.awards.map((w) => <li><span class="muted">{w.year}</span><strong>{w.title}</strong><span>{w.body}</span></li>)}
        </ul>
      </div>
      <div>
        <h3>학력 · 자격</h3>
        <p>{a.edu}</p>
        <ul class="plain">{a.certs.map((c) => <li>{c}</li>)}</ul>
        <h3 style="margin-top:24px">사용 툴</h3>
        <p class="tools">{a.tools.join(' · ')}</p>
      </div>
    </div>
  </div>
</section>
<style>
  .intro { margin-top: 18px; max-width: 60ch; font-size: 17px; }
  .cols { display: grid; gap: 40px; grid-template-columns: 1.4fr 1fr; margin-top: 40px; }
  .awards, .plain { list-style: none; padding: 0; margin: 12px 0 0; }
  .awards li { display: grid; grid-template-columns: 70px 1fr; gap: 2px 14px; padding: 10px 0; border-top: 1px solid var(--line); font-size: 14px; }
  .awards strong { grid-column: 2; }
  .awards li > span:last-child { grid-column: 2; color: var(--muted); }
  .plain li { font-size: 14px; color: var(--muted); }
  .tools { font-size: 14px; color: var(--muted); }
  @media (max-width: 700px) { .cols { grid-template-columns: 1fr; gap: 28px; } }
</style>
```

- [ ] **Step 6: Contact.astro**

```astro
---
import { site } from '../data/site';
---
<section id="contact">
  <div class="wrap">
    <p class="label">Contact</p>
    <h2>문의</h2>
    <p class="muted" style="margin-top:12px">작업 범위와 일정을 알려주시면 견적을 드립니다.</p>
    <div class="links">
      <a class="btn accent" href={`mailto:${site.email}`}>{site.email}</a>
      <a class="btn" href={site.phoneHref}>{site.phone}</a>
      <a class="btn" href="/intro">소개서 보기 · PDF</a>
    </div>
    <dl class="biz">
      <dt>상호</dt><dd>{site.name} ({site.nameEn})</dd>
      <dt>대표</dt><dd>{site.owner}</dd>
      <dt>사업자등록번호</dt><dd>{site.bizNo}</dd>
      <dt>소재지</dt><dd>{site.address}</dd>
    </dl>
  </div>
</section>
<style>
  .links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .biz { display: grid; grid-template-columns: max-content 1fr; gap: 6px 20px; margin: 40px 0 0; font-size: 14px; }
  .biz dt { color: var(--muted); }
  .biz dd { margin: 0; }
</style>
```

- [ ] **Step 7: index.astro 교체**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import WorkGrid from '../components/WorkGrid.astro';
import Services from '../components/Services.astro';
import About from '../components/About.astro';
import Contact from '../components/Contact.astro';
import { site } from '../data/site';
---
<Base title={`${site.name} — 영상 편집 · 사운드`} description={site.hero.sub}>
  <Hero />
  <WorkGrid />
  <Services />
  <About />
  <Contact />
</Base>
```

- [ ] **Step 8: 빌드·눈으로 확인**

```bash
npm run build && node scripts/check.mjs
npx astro preview --port 4321 &
sleep 2
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --window-size=1280,2400 --screenshot="C:/Users/yeongungod/.claude/jobs/5205fbd7/tmp/home-desktop.png" http://localhost:4321/
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --window-size=390,3000 --screenshot="C:/Users/yeongungod/.claude/jobs/5205fbd7/tmp/home-mobile.png" http://localhost:4321/
```
Read 도구로 두 PNG를 열어 확인: 섹션 7개가 순서대로 있고, 모바일에서 가로 스크롤(잘린 글자·카드)이 없고, 아쿠아마린은 라벨·선·버튼에만 쓰였는지. 어긋나면 해당 컴포넌트 CSS를 고치고 다시 찍는다. preview 프로세스는 `kill %1`.

- [ ] **Step 9: 커밋**

```bash
git add -A && git commit -q -m "feat: 홈 원페이지 — 히어로·대표작·하는 일·스튜디오·문의

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 4: `/work` 아카이브 표 + 필터

**Files:**
- Create: `src/components/ArchiveTable.astro`, `src/pages/work.astro`

**Interfaces:**
- Consumes: `archive.json` Row 타입(Task 2)

- [ ] **Step 1: ArchiveTable.astro**

```astro
---
import rows from '../data/archive.json';
const PLATFORM: Record<string, string> = { Film: '영화', Live: '라이브', Music: '음악', Web: '웹콘텐츠', Edit: '편집', Game: '게임사운드' };
const PROCESS: Record<string, string> = { Mixing: '믹싱', 'Sound Design': '사운드디자인', ADR: 'ADR', Foley: '폴리', Record: '녹음', Mastering: '마스터링', 'Sound Assistant': '사운드 어시스트', PA: 'PA', Cinamatic: '시네마틱', Skill: '스킬', UI: 'UI' };
const filters = ['전체', ...Object.values(PLATFORM)];
const sorted = [...rows].sort((a, b) => b.year - a.year);
---
<div class="filters" role="group" aria-label="분야 필터">
  {filters.map((f, i) => <button class:list={['chip', { on: i === 0 }]} data-f={f}>{f}</button>)}
</div>
<p class="muted count" aria-live="polite"><span id="count">{sorted.length}</span>건</p>
<table class="archive">
  <thead><tr><th>연도</th><th>작업</th><th>분야</th><th>역할</th><th>클라이언트</th></tr></thead>
  <tbody>
    {sorted.map((r) => (
      <tr data-p={r.platform.map((p) => PLATFORM[p]).join(' ')}>
        <td>{r.year}</td>
        <td class="name">{r.name}</td>
        <td>{r.platform.map((p) => PLATFORM[p]).join(', ')}</td>
        <td class="muted">{r.process.map((p) => PROCESS[p] ?? p).join(' · ')}</td>
        <td class="muted">{r.client}</td>
      </tr>
    ))}
  </tbody>
</table>

<style>
  .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
  .chip { background: none; border: 1px solid var(--line); color: var(--paper); border-radius: 999px; padding: 6px 14px; font: inherit; font-size: 14px; cursor: pointer; }
  .chip.on { background: var(--accent); border-color: var(--accent); color: var(--ink); font-weight: 600; }
  .count { margin: 16px 0 8px; font-size: 14px; }
  .archive { width: 100%; border-collapse: collapse; font-size: 14px; }
  .archive th { text-align: left; font-weight: 600; color: var(--muted); padding: 8px 10px 8px 0; border-bottom: 1px solid var(--line); font-size: 12px; letter-spacing: .06em; }
  .archive td { padding: 10px 10px 10px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  .name { font-weight: 600; }
  tr[hidden] { display: none; }
  @media (max-width: 700px) {
    .archive thead { display: none; }
    .archive tr { display: grid; grid-template-columns: 56px 1fr; gap: 2px 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
    .archive td { border: 0; padding: 0; }
    .archive td:nth-child(n+3) { grid-column: 2; font-size: 13px; }
  }
</style>

<script>
  const chips = document.querySelectorAll<HTMLButtonElement>('.chip');
  const rows = document.querySelectorAll<HTMLTableRowElement>('tr[data-p]');
  const count = document.getElementById('count')!;
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.classList.toggle('on', x === c));
    const f = c.dataset.f!;
    let n = 0;
    rows.forEach((r) => { const show = f === '전체' || r.dataset.p!.split(' ').includes(f); r.hidden = !show; if (show) n++; });
    count.textContent = String(n);
  }));
</script>
```

- [ ] **Step 2: work.astro**

```astro
---
import Base from '../layouts/Base.astro';
import ArchiveTable from '../components/ArchiveTable.astro';
import { site } from '../data/site';
---
<Base title={`전체 작업 — ${site.name}`} description="2019년부터 지금까지의 영상·사운드·라이브 작업 목록.">
  <section style="border-top:0">
    <div class="wrap">
      <p class="label">Archive</p>
      <h2>전체 작업</h2>
      <p class="muted" style="margin-top:10px">2019년부터. 노션 작업 기록을 옮긴 목록이라 빠진 건도 있습니다.</p>
      <ArchiveTable />
    </div>
  </section>
</Base>
```

- [ ] **Step 3: 빌드·확인·커밋**

```bash
npm run build && node scripts/check.mjs
```
Expected: check가 「intro/index.html 없음」 1개만 남김. `dist/work/index.html`에 `<tr` 117개:
```bash
grep -o "<tr data-p" dist/work/index.html | wc -l
```
Expected: 117. 헤드리스 크롬으로 390px 스크린샷을 찍어 모바일 카드형 표가 읽히는지 본다.

```bash
git add -A && git commit -q -m "feat: /work 아카이브 표 117건 + 분야 필터

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 5: `/intro` 소개서 + PDF 생성

**Files:**
- Create: `src/pages/intro.astro`, `scripts/make-pdf.mjs`
- Modify: `src/styles/global.css` (인쇄 규칙 추가)

**Interfaces:**
- Consumes: `site`, `featured`, `VideoCard`(compact)
- Produces: `G:\91_uniStudio\소개서\YYMMDD_우니스튜디오_소개서.pdf`

- [ ] **Step 1: intro.astro** — 화면에선 종이 카드처럼, 인쇄에선 A4 한 장

```astro
---
import Base from '../layouts/Base.astro';
import { site } from '../data/site';
import { featured } from '../data/featured';
const six = featured.slice(0, 6);
const a = site.about;
---
<Base title={`${site.name} 소개서`} description="우니스튜디오 소개서 — 영상 편집 · 사운드. 인쇄용 한 장." bodyClass="intro-body">
  <div class="toolbar no-print wrap">
    <p class="muted">이 페이지가 소개서입니다. 브라우저 인쇄에서 「PDF로 저장」하면 A4 한 장이 됩니다.</p>
    <button class="btn accent" onclick="window.print()">PDF로 저장</button>
  </div>

  <article class="sheet">
    <header class="head">
      <img src="/lockup.svg" alt="uniStudio" width="220" height="43" />
      <p class="tag">영상 편집 · 사운드</p>
    </header>

    <h1>{site.hero.title}</h1>
    <p class="sub">{site.hero.sub}</p>

    <div class="two">
      <div>
        <h2>하는 일</h2>
        <ul>{site.services.map((s) => <li><strong>{s.title}</strong> — {s.desc}</li>)}</ul>
        <h2>진행</h2>
        <p>{site.process.join(' → ')}. {site.processNote}</p>
      </div>
      <div>
        <h2>대표</h2>
        <p><strong>{site.owner}</strong> · {a.edu}</p>
        <ul class="tight">{a.awards.slice(0, 4).map((w) => <li>{w.year} {w.title} — {w.body}</li>)}</ul>
        <p class="small">{a.tools.join(' · ')}</p>
      </div>
    </div>

    <h2>대표작</h2>
    <div class="works">
      {six.map((w) => (
        <div class="w">
          <img src={w.youtube ? `https://i.ytimg.com/vi/${w.youtube}/mqdefault.jpg` : w.image} alt="" />
          <p><strong>{w.title}</strong><br /><span>{w.role} · {w.year}</span></p>
        </div>
      ))}
    </div>

    <footer class="foot">
      <p><strong>{site.email}</strong> · {site.phone} · yeongungod.com</p>
      <p class="small">{site.name} · 대표 {site.owner} · 사업자등록번호 {site.bizNo} · {site.address}</p>
    </footer>
  </article>
</Base>

<style>
  .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px 16px; flex-wrap: wrap; }
  .sheet {
    background: var(--paper); color: var(--ink); width: 210mm; min-height: 297mm; margin: 0 auto 48px;
    padding: 16mm 16mm 14mm; box-sizing: border-box; font-size: 10.5pt; line-height: 1.5;
  }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--accent); padding-bottom: 8px; }
  .tag { font-size: 9pt; color: var(--muted); letter-spacing: .08em; }
  .sheet h1 { font-size: 22pt; margin-top: 14px; }
  .sub { color: var(--muted); margin-top: 6px; }
  .sheet h2 { font-size: 10pt; color: var(--accent); letter-spacing: .1em; text-transform: uppercase; margin-top: 16px; border-bottom: 1px solid #e6e2dc; padding-bottom: 4px; }
  .sheet h2 { color: #4f8aa3; } /* 종이 위 대비용 — 아쿠아마린은 면적에만, 글자는 진하게 */
  .two { display: grid; grid-template-columns: 1.15fr 1fr; gap: 24px; }
  .sheet ul { padding-left: 14px; margin: 6px 0 0; }
  .sheet li { margin: 3px 0; }
  .tight li { font-size: 9.5pt; }
  .small { font-size: 9pt; color: var(--muted); margin-top: 6px; }
  .works { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
  .w img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 3px; }
  .w p { font-size: 9pt; margin-top: 4px; line-height: 1.35; }
  .w span { color: var(--muted); }
  .foot { margin-top: auto; border-top: 1px solid #e6e2dc; padding-top: 8px; }
  .foot p:first-child { font-size: 11pt; }
  @media (max-width: 800px) { .sheet { width: 100%; min-height: 0; padding: 20px 16px; } .two, .works { grid-template-columns: 1fr; } .works { grid-template-columns: 1fr 1fr; } }
</style>
```

`public/lockup.svg`가 필요하다:
```bash
cp "/g/91_uniStudio/브랜드/logo/unistudio-lockup.svg" public/lockup.svg
```

- [ ] **Step 2: global.css 끝에 인쇄 규칙 추가**

```css
/* /intro 인쇄 */
.intro-body .site-header, .intro-body .site-footer { display: none; }
.intro-body { background: #2a2724; }
@media print {
  @page { size: A4; margin: 0; }
  body, .intro-body { background: #fff; }
  .no-print { display: none !important; }
  .sheet { margin: 0; width: 210mm; height: 297mm; min-height: 0; box-shadow: none; display: flex; flex-direction: column; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
.sheet { display: flex; flex-direction: column; }
```

- [ ] **Step 3: make-pdf.mjs** — dist를 로컬로 띄우고 크롬으로 PDF

```js
// npm run build 후 실행. dist/intro를 크롬 헤드리스로 A4 PDF로 뽑아 G:에 저장.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'G:\\91_uniStudio\\소개서';
const d = new Date();
const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const out = `${OUT_DIR}\\${ymd}_우니스튜디오_소개서.pdf`;
const tmp = `${process.cwd()}\\dist\\intro.pdf`;

const server = spawn('npx', ['astro', 'preview', '--port', '4399'], { shell: true, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 3000));
try {
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${tmp}`, 'http://localhost:4399/intro/'], { stdio: 'ignore' });
  if (existsSync(OUT_DIR.replace(/\\/g, '/'))) { copyFileSync(tmp, out); console.log('saved', out); }
  else console.log('G: 없음 — dist/intro.pdf 만 남김');
} finally {
  server.kill();
  process.exit(0);
}
```

- [ ] **Step 4: 빌드 → PDF → 눈으로 확인**

```bash
npm run build && node scripts/check.mjs && npm run pdf
```
Expected: check 통과(문제 0), `G:\91_uniStudio\소개서\260916_우니스튜디오_소개서.pdf` 생성. Read 도구로 PDF를 열어 **한 장**인지, 대표작 6개 썸네일이 보이는지, 아래 연락처가 잘리지 않았는지 확인한다. 두 장으로 넘어가면 `.sheet` 폰트 크기(10.5pt→10pt)나 `.works` 썸네일 높이를 줄인다.

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -q -m "feat: /intro 소개서 페이지 + A4 PDF 생성 스크립트

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 6: OG 이미지 + 로봇·사이트맵

**Files:**
- Create: `scripts/make-og.py`, `public/og.png`, `public/robots.txt`, `src/pages/sitemap.xml.ts`

- [ ] **Step 1: make-og.py** — 먹 배경 1200×630에 흰 락업 + 문구

```python
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
W, H = 1200, 630
im = Image.new('RGB', (W, H), '#141210')
lock = Image.open(r'G:\91_uniStudio\브랜드\logo\unistudio-lockup-white.png').convert('RGBA')
lw = 520; lh = int(lock.height * lw / lock.width)
lock = lock.resize((lw, lh), Image.LANCZOS)
im.paste(lock, (80, 150), lock)
d = ImageDraw.Draw(im)
f1 = ImageFont.truetype(r'C:\Windows\Fonts\SUITE-Bold.ttf', 44)
f2 = ImageFont.truetype(r'C:\Windows\Fonts\SUITE-Medium.ttf', 26)
d.text((80, 150 + lh + 60), '영상 편집과 사운드를 한 곳에서.', font=f1, fill='#FBF9F6')
d.text((80, 150 + lh + 120), '유튜브 롱폼·쇼츠 편집 · 영화·웹콘텐츠 믹싱 · yeongungod.com', font=f2, fill='#8A837C')
d.rectangle((80, 150 + lh + 170, 136, 150 + lh + 174), fill='#9CC3D5')
im.save('public/og.png', optimize=True)
print('ok', im.size)
```
```bash
PYTHONUTF8=1 python scripts/make-og.py
```
Read 도구로 `public/og.png` 확인 — 글자가 잘리지 않고 락업이 왼쪽 위에 있어야 한다.

- [ ] **Step 2: robots.txt · sitemap**

`public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://yeongungod.com/sitemap.xml
```

`src/pages/sitemap.xml.ts`
```ts
export function GET() {
  const base = 'https://yeongungod.com';
  const urls = ['/', '/work/', '/intro/'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
```

- [ ] **Step 3: 빌드·확인·커밋**

```bash
npm run build && node scripts/check.mjs && ls dist/og.png dist/robots.txt dist/sitemap.xml && grep -c "<loc>" dist/sitemap.xml
```
Expected: 파일 3개 존재, `<loc>` 3.
```bash
git add -A && git commit -q -m "feat: OG 이미지·robots·sitemap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa"
```

---

### Task 7: 최종 검증 → Vercel 프리뷰 → main 합침

**Files:** 없음(검증·배포)

- [ ] **Step 1: 전체 검사**

```bash
rm -rf dist && npm run build && node scripts/check.mjs
grep -rl "pyu0205\|Selene" src public && echo "금지 문자열 있음" || echo "clean"
```
Expected: check 통과, `clean`.

- [ ] **Step 2: 세 페이지 스크린샷(데스크톱·모바일) 최종 확인**

```bash
npx astro preview --port 4321 &
sleep 2
for p in "" work intro; do for w in 1280 390; do
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --window-size=$w,2400 --screenshot="C:/Users/yeongungod/.claude/jobs/5205fbd7/tmp/final-${p:-home}-$w.png" "http://localhost:4321/$p"
done; done
kill %1
```
6장을 Read로 열어 본다. 기준: 가로 스크롤 없음 · 아쿠아마린은 라벨·선·버튼·마크에만 · 대표작 카드 8개 · 표 필터 칩 7개 · 소개서가 종이 카드로 보임.

- [ ] **Step 3: 브랜치 push → Vercel 프리뷰**

```bash
git push -u origin rebuild-astro
```
Vercel이 GitHub 연동돼 있으면 프리뷰 URL이 자동으로 생긴다. 사용자에게 **프리뷰 URL 또는 Vercel 대시보드에서 확인**을 요청한다. ⚠️ Vercel 프로젝트 설정의 Framework Preset이 Next.js로 남아 있으면 빌드가 실패한다 — 그 경우 Vercel 대시보드 → Settings → Build & Development → Framework Preset을 **Astro**로 바꾸고(Build `astro build`, Output `dist`) 재배포. 이건 사용자 계정 작업이라 사용자에게 안내한다.

- [ ] **Step 4: 프리뷰에서 3페이지 + PDF 저장 동작 확인 후 main 합침**

사용자가 프리뷰를 확인하고 OK하면:
```bash
git checkout main && git merge --no-ff rebuild-astro -m "우니스튜디오 사이트로 교체 (Astro)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014ssQv7Yqcc4gUiyjPAkToa" && git push origin main
```
Expected: Vercel이 main을 배포 → https://yeongungod.com 에서 새 사이트. 배포 후 `curl -sI https://yeongungod.com | head -1` → `HTTP/2 200`.

- [ ] **Step 5: uniBusiness 기록**

`C:\uniAI\uniBusiness\CLAUDE.md` 2-4절 브랜드 자산 항목 아래에 한 줄 추가하고, 체크리스트 완료 기록 09-16 행에 「사이트 교체」를 덧붙인다:
```
- ⭐ **사이트 (2026-09-16)**: yeongungod.com = 우니스튜디오 원페이지(Astro, 저장소 `GitHub\unifolio`, Vercel). 내용은 `src/data/` 3파일. 소개서 = `/intro` → PDF `G:\91_uniStudio\소개서\`. 대표작 8건은 임시 선정 — 재선정 시 `featured.ts`만
```
`sync.ps1`은 Stop 훅이 돌린다.

---

## Self-review

- 스펙 대비: 페이지 3개(T3·T4·T5) · 데이터 3파일(T2) · 브랜드 색·서체(T1) · 유튜브 지연 임베드(T3 VideoCard) · 소개서 PDF + G: 저장(T5) · OG·파비콘(T1·T6) · 검증 기준(T1 check.mjs + T7 스크린샷) · 배포(T7) · 대표작 임시 8건(T2) · 문의 메일·전화만(T3 Contact) · 단가 없음 ✓
- 대표 사진: 스펙에 「Face01 또는 이력서 사진, 사용자 확인」이라 적었으나 **B 톤 원페이지엔 사진 자리를 두지 않았다.** 사진 없이 가고, 원하면 About에 넣는다 — 스펙의 「모을 것」 목록에서 빠지는 항목이라 사용자에게 한 줄 알린다.
- 타입 일치: `Featured`(T2) ↔ `VideoCard` props(T3) ↔ `intro.astro`(T5) 같은 필드명. `site.processNote`·`about.certs`는 T2 정의, T3·T5에서 사용 ✓
- 플레이스홀더 없음. 검사 스크립트가 「TODO/TBD」를 빌드 산출물에서 잡는다.
