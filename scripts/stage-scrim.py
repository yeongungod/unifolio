"""무대 막 농도를 작품마다 실측해 src/data/stage-scrim.json에 쓴다(DESIGN.md 웹 무대: 큰 글자 3:1).

무대 왼쪽 80% x 위아래 전체(데스크톱), 무대 전체(휴대폰)를 제목 한 줄 크기 타일(높이 60px x 폭 1/5)로 나눠 4개 화면 크기,
스틸과 루프 프레임(1초마다) 모두에서 잰다(v7 제목·크레딧 자리를 넉넉히 덮는 보수적 범위). 모든 타일에서 종이색 100% 글자와
종이색 65% 글자가 픽셀 98%에서 3:1을 넘는 가장 옅은 막을 0.05 단위로 고른다. 결과는 {작품: {src: 잰 이미지, scrim}}이고,
무대는 지금 이미지가 src와 같을 때만 이 값을 쓴다(이미지를 바꾸면 다시 잴 때까지 기본값 SAFE, src/lib/stage.mjs).
Pillow·numpy가 있는 로컬에서 실행하고 결과 JSON을 커밋한다(배포 빌드엔 파이썬이 필요 없다).
    PYTHONUTF8=1 python scripts/stage-scrim.py
"""
import json, re, subprocess, tempfile, shutil
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DIM, SAFE = 0.65, 0.65  # DIM = 옅은 글자 기준, SAFE = src/lib/stage.mjs SAFE_SCRIM과 같아야 한다
INK, PAPER = np.array([20, 18, 16.]), np.array([251, 249, 246.])
VIEWS = [(1440, 839, 'd'), (1280, 739, 'd'), (1920, 1019, 'd'), (390, 658, 'm')]
FFMPEG = shutil.which('ffmpeg') or r'C:\Users\yeongungod\AppData\Local\Programs\FFmpeg\bin\ffmpeg.exe'


def lum(a):
    c = a / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def cover(img, w, h, focus):
    iw, ih = img.size
    s = max(w / iw, h / ih)
    dw, dh = round(iw * s), round(ih * s)
    fx, fy = (int(v.rstrip('%')) / 100 for v in focus.split())
    x, y = round((dw - w) * fx), round((dh - h) * fy)
    return np.asarray(img.convert('RGB').resize((dw, dh)).crop((x, y, x + w, y + h)), dtype=float)


def tiles(px, kind):
    h, w = px.shape[:2]
    z = px[:, : w * 4 // 5] if kind == 'd' else px
    th, tw = 60, max(1, z.shape[1] // 5)
    return [z[y:y + th, x:x + tw].reshape(-1, 3)[::2] for y in range(0, z.shape[0] - th + 1, th // 2) for x in range(0, z.shape[1] - tw + 1, tw)]


def contrast_ok(regs, a):
    dim = on = 99.0
    for reg in regs:
        bg = a * INK + (1 - a) * reg
        lb = lum(bg)
        lt = lum(DIM * PAPER + (1 - DIM) * bg)
        dim = min(dim, float(np.percentile((np.maximum(lt, lb) + .05) / (np.minimum(lt, lb) + .05), 2)))
        on = min(on, float(np.percentile((lum(PAPER) + .05) / (lb + .05), 2)))
    return dim >= 3 and on >= 3, dim, on


def main():
    src = (ROOT / 'src/data/featured.ts').read_text(encoding='utf-8')
    items = json.loads(re.search(r'export const featured[^=]*=\s*(\[[\s\S]*\]);', src)[1])
    out, table = {}, []
    with tempfile.TemporaryDirectory() as tmp:
        for it in items:
            path = it.get('image') or f"/images/work/youtube/{it['youtube']}.jpg"
            frames = [ROOT / 'public' / path.lstrip('/')]
            if it.get('loop'):
                pattern = Path(tmp) / (it['slug'] + '_%02d.png')
                subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-i', str(ROOT / 'public' / it['loop'].lstrip('/')), '-vf', 'fps=1', str(pattern)], check=True)
                frames += sorted(Path(tmp).glob(it['slug'] + '_*.png'))
            regs = []
            for f in frames:
                with Image.open(f) as img:
                    for w, h, kind in VIEWS:
                        regs += tiles(cover(img, w, h, it.get('focus', '50% 40%')), kind)
            for a in [round(0.2 + 0.05 * k, 2) for k in range(11)]:
                ok, dim, on = contrast_ok(regs, a)
                if ok:
                    break
            assert ok, it['title']
            out[it['slug']] = {'src': it.get('image') or f"https://i.ytimg.com/vi/{it['youtube']}/maxresdefault.jpg", 'scrim': a}
            table.append((it['title'][:24], a, round(dim, 2), round(on, 2), len(frames)))
    (ROOT / 'src/data/stage-scrim.json').write_text(json.dumps(out, indent=2) + '\n', encoding='utf-8')
    print('작품 | 막 | 꺼진 이름 대비(2% 하위) | 켜진 이름 대비 | 잰 장면 수')
    for row in table:
        print(' | '.join(map(str, row)))
    assert contrast_ok([np.array([[255., 255., 255.]])], SAFE)[0], '기본 막은 흰 바탕에서도 3:1이어야 한다'


if __name__ == '__main__':
    main()
