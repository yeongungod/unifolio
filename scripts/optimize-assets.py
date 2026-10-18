"""무대 스틸의 반응형 WebP 변형을 만든다(원본은 그대로 둔다).

Pillow가 있는 로컬에서 실행하고 결과(webp·src/data/optimized-images.json)를 커밋한다. 배포 빌드엔 파이썬이 필요 없다.
대표 이미지가 있으면 그것, 유튜브만 있으면 maxres(1280×720)를 받아 둔다. 원본보다 넓은 변형은 만들지 않는다
(지금 원본은 모두 1280px 이하라 1920·2560은 더 큰 원본이 들어올 때만 생긴다).
    PYTHONUTF8=1 python scripts/optimize-assets.py
"""
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
WIDTHS = [360, 720, 960, 1080, 1280, 1920, 2560]  # 960 = 휴대폰 2배, 1280 = 데스크톱 전면 무대, 1920·2560 = 큰·고해상도 화면


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def main():
    sources = {}
    featured = (ROOT / 'src/data/featured.ts').read_text(encoding='utf-8')
    for url in re.findall(r'"image":\s*"(/images/[^"?]+)"', featured):
        sources[url] = WIDTHS
    items = json.loads(re.search(r'export const featured[^=]*=\s*(\[[\s\S]*\]);', featured)[1])
    thumbnails = {}
    for item in items:
        if item.get('youtube') and not item.get('image'):
            video = item['youtube']
            assert re.fullmatch(r'[\w-]{11}', video), video
            remote = f'https://i.ytimg.com/vi/{video}/maxresdefault.jpg'  # 무대(16:9)용 1280×720
            local = f'/images/work/youtube/{video}.jpg'
            original = PUBLIC / local.lstrip('/')
            if not original.exists():
                original.parent.mkdir(parents=True, exist_ok=True)
                with urlopen(remote, timeout=20) as response:
                    data = response.read()
                original.write_bytes(data)
            sources[local] = WIDTHS
            thumbnails[local] = remote
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
                resized.save(dest, 'WEBP', quality=82, method=6)
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
