"""Regenerate full-glyph WOFF2 and responsive WebP assets; keep originals.

Run locally with Python, fontTools[woff], and Pillow installed. Generated files
are committed, so the deployment build does not require Python.
"""
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

from fontTools.ttLib import TTFont
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def main():
    for original in sorted((PUBLIC / 'fonts').glob('SUITE-*.ttf')):
        original_hash = digest(original)
        font = TTFont(original, recalcTimestamp=False)
        font.flavor = 'woff2'
        converted = original.with_suffix('.woff2')
        font.save(converted)
        restored = TTFont(converted)
        assert font.getGlyphOrder() == restored.getGlyphOrder(), original.name
        assert font.getBestCmap() == restored.getBestCmap(), original.name
        assert original_hash == digest(original), original.name
        print(f'{original.name}: {original.stat().st_size} -> {converted.stat().st_size}')

    sources = {}
    featured = (ROOT / 'src/data/featured.ts').read_text(encoding='utf-8')
    for url in re.findall(r'"image":\s*"(/images/[^"?]+)"', featured):
        sources[url] = [360, 720, 1080]
    items = json.loads(re.search(r'export const featured[^=]*=\s*(\[[\s\S]*\]);', featured)[1])
    thumbnails = {}
    for item in items:
        if item.get('youtube') and not item.get('image'):
            video = item['youtube']
            assert re.fullmatch(r'[\w-]{11}', video), video
            remote = f'https://i.ytimg.com/vi/{video}/hqdefault.jpg'
            local = f'/images/work/youtube/{video}.jpg'
            original = PUBLIC / local.lstrip('/')
            if not original.exists():
                original.parent.mkdir(parents=True, exist_ok=True)
                with urlopen(remote, timeout=20) as response:
                    data = response.read()
                original.write_bytes(data)
            sources[local] = [360, 720]
            thumbnails[local] = remote
    for file, folder, widths in [
        ('src/data/clients.ts', 'clients', [180, 360, 720]),
        ('src/components/About.astro', 'tools', [28, 56, 84]),
    ]:
        text = (ROOT / file).read_text(encoding='utf-8')
        for name in re.findall(r"file:\s*'([^']+)'", text):
            sources[f'/images/{folder}/{name}'] = widths

    manifest = {}
    for url, widths in sorted(sources.items()):
        original = PUBLIC / url.lstrip('/')
        if original.suffix.lower() == '.svg':
            continue
        assert original.is_file(), url
        original_hash = digest(original)
        with Image.open(original) as image:
            image = image.convert('RGBA' if image.mode in ('RGBA', 'P') else 'RGB')
            actual_widths = sorted({min(width, image.width) for width in widths})
            variants = []
            for width in actual_widths:
                height = max(1, round(image.height * width / image.width))
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                dest_url = url.replace('/images/', '/images/optimized/', 1) + f'.{width}.webp'
                dest = PUBLIC / dest_url.lstrip('/')
                dest.parent.mkdir(parents=True, exist_ok=True)
                # Client marks keep lossless color/alpha; video stills favor size.
                resized.save(dest, 'WEBP', quality=82, lossless='/clients/' in url, method=6)
                with Image.open(dest) as decoded:
                    assert decoded.size == (width, height), dest_url
                variants.append({'src': dest_url, 'width': width})
            manifest[thumbnails.get(url, url)] = variants
        assert original_hash == digest(original), url

    output = ROOT / 'src/data/optimized-images.json'
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(manifest)} source images, {sum(map(len, manifest.values()))} WebP variants')


if __name__ == '__main__':
    main()
