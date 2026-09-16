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
  if (existsSync('G:\\')) { mkdirSync(OUT_DIR, { recursive: true }); copyFileSync(tmp, out); console.log('saved', out); }
  else console.log('G: 없음 — dist/intro.pdf 만 남김');
} finally {
  server.kill();
  process.exit(0);
}
