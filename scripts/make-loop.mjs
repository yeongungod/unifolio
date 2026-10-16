// 대표작 무대용 무음 루프 클립 만들기(ffmpeg).
//   node scripts/make-loop.mjs <원본 영상> <시작 시각 초|hh:mm:ss> <길이 6~8초> <slug> [--webm] [--out <폴더>]
// 출력: <out>/<slug>.mp4(1280×720 H.264 무음 약 2Mbps) · <slug>.jpg(첫 프레임 포스터) · --webm이면 <slug>.webm(AV1)
// 기본 출력 폴더 public/video/loops/. featured.ts의 해당 작품에 "loop": "/video/loops/<slug>.mp4"를 넣으면 무대에 쓰인다.
// 🔴 남의 작품(영화·광고) 장면이다. 공개 전에 감독·권리자 사용 허락을 받는다. 원본 영상 파일은 저장소에 넣지 않는다.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args.splice(i, name === '--out' ? 2 : 1)[1] ?? true; };
const webm = flag('--webm'), out = flag('--out') ?? 'public/video/loops';
const [input, start, length, slug] = args;
const seconds = Number(length);
if (!input || !start || !slug || !existsSync(input)) throw new Error('사용법: node scripts/make-loop.mjs <원본 영상> <시작> <길이 6~8> <slug> [--webm] [--out 폴더]');
if (!(seconds >= 6 && seconds <= 8)) throw new Error('길이는 6~8초');
if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('slug는 영문 소문자·숫자·하이픈만(featured.ts 검증과 같음)');

const bin = process.env.FFMPEG_DIR ?? 'C:/Users/yeongungod/AppData/Local/Programs/FFmpeg/bin';
const tool = (name) => (existsSync(join(bin, `${name}.exe`)) ? join(bin, `${name}.exe`) : name);
const ffmpeg = (...a) => execFileSync(tool('ffmpeg'), ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
mkdirSync(out, { recursive: true });
const file = (ext) => join(out, `${slug}.${ext}`);
// 16:9로 꽉 채워 자른다(세로·4:3 원본도 1280×720). 소리는 버린다(-an).
// 영화 예고편의 위아래 검은 띠(레터박스)는 cropdetect로 먼저 걷어 낸다.
const detect = spawnSync(tool('ffmpeg'), ['-hide_banner', '-ss', start, '-t', String(seconds), '-i', input, '-vf', 'cropdetect=24:2:0', '-f', 'null', '-'], { encoding: 'utf8' }).stderr ?? '';
const bars = [...detect.matchAll(/crop=(\d+:\d+:\d+:\d+)/g)].at(-1)?.[1];
const vf = `${bars ? `crop=${bars},` : ''}scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=30`;
const cut = ['-ss', start, '-t', String(seconds), '-i', input, '-an', '-vf', vf];

ffmpeg(...cut, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-b:v', '2M', '-maxrate', '2.5M', '-bufsize', '4M', '-preset', 'slow', '-movflags', '+faststart', file('mp4'));
ffmpeg('-i', file('mp4'), '-frames:v', '1', '-q:v', '3', file('jpg'));
if (webm) ffmpeg(...cut, '-c:v', 'libsvtav1', '-crf', '38', '-preset', '6', '-pix_fmt', 'yuv420p', file('webm'));

// 결과 자체 점검: 1280×720 · 소리 없음 · 길이
for (const ext of ['mp4', ...(webm ? ['webm'] : [])]) {
  const probe = JSON.parse(execFileSync(tool('ffprobe'), ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file(ext)], { encoding: 'utf8' }));
  const video = probe.streams.filter((s) => s.codec_type === 'video'), audio = probe.streams.filter((s) => s.codec_type === 'audio');
  if (video.length !== 1 || video[0].width !== 1280 || video[0].height !== 720 || audio.length || Math.abs(Number(probe.format.duration) - seconds) > 0.5) throw new Error(`${file(ext)} 점검 실패`);
  console.log(`${file(ext)}  ${(statSync(file(ext)).size / 1024 / 1024).toFixed(2)} MB  ${Number(probe.format.duration).toFixed(1)}s  ${video[0].codec_name}`);
}
console.log(`${file('jpg')}  포스터`);
