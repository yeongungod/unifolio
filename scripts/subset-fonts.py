"""SUITE 핵심 글자 파일(-core.woff2) 만들기. 실행: PYTHONUTF8=1 python scripts/subset-fonts.py

웹 첫 화면 폰트를 줄이려고(모바일 LCP) 사이트에 실제로 쓰인 글자만 담는다:
영문·숫자·라틴-1 + 문장부호·화살표·CJK 기호(「」·㈜) + src/ 아래 데이터·화면 파일에 쓰인 모든 글자.
(KS X 1001 한글 2,350자 전체는 118KB라 효과가 없어서 쓰지 않는다)
여기 없는 글자는 global.css의 전체 woff2 면(같은 SUITE 이름)이 그 글자에만 대신 들어간다.
그 면의 unicode-range도 이 스크립트가 전체 폰트 cmap에서 만들어 global.css에 다시 쓴다(손으로 고치지 말 것).
사이트 데이터에 새 글자가 늘어도 깨지지 않지만, 자주 쓰게 되면 이 스크립트를 다시 돌린다.
"""
import re
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'public' / 'fonts'
CSS = ROOT / 'src' / 'styles' / 'global.css'
DATA = [p for p in (ROOT / 'src').rglob('*') if p.suffix in ('.ts', '.json', '.astro', '.js', '.mjs')]

codes = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x2000, 0x2070)) | set(range(0x2190, 0x2200))
codes |= set(range(0x3000, 0x3040)) | set(range(0x3131, 0x318F)) | set(range(0x3200, 0x3300)) | set(range(0xFF01, 0xFF5F))
for path in DATA:
    codes |= {ord(ch) for ch in path.read_text(encoding='utf-8')}


def unicode_range(cps):
    """cmap 글자 목록을 붙어 있는 구간끼리 묶어 CSS unicode-range로."""
    spans = []
    for c in sorted(cps):
        if spans and c == spans[-1][1] + 1:
            spans[-1][1] = c
        else:
            spans.append([c, c])
    return ', '.join(f'U+{a:04X}' if a == b else f'U+{a:04X}-{b:04X}' for a, b in spans)


def expand(text):
    out = set()
    for part in text.split(','):
        a, _, b = part.strip()[2:].partition('-')
        out |= set(range(int(a, 16), int(b or a, 16) + 1))
    return out


css = CSS.read_text(encoding='utf-8')
for weight in ('Medium', 'SemiBold', 'Bold'):
    font = TTFont(FONTS / f'SUITE-{weight}.ttf')
    cmap = set(font.getBestCmap())
    rng = unicode_range(cmap)
    css, n = re.subn(rf"(url\('/fonts/SUITE-{weight}\.woff2'\)[^\n]*?unicode-range: )[^;]+;", lambda m: m.group(1) + rng + ';', css)
    assert n == 1 and expand(rng) == cmap, weight
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    sub = subset.Subsetter(options)
    sub.populate(unicodes=sorted(codes & set(font.getBestCmap())))
    sub.subset(font)
    out = FONTS / f'SUITE-{weight}-core.woff2'
    font.flavor = 'woff2'
    font.save(out)
    print(out.name, round(out.stat().st_size / 1024, 1), 'KB')
CSS.write_text(css, encoding='utf-8')
print(CSS.name, '전체 면 unicode-range', rng.count(',') + 1, '구간')
