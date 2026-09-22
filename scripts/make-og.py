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
d.text((80, 150 + lh + 60), '장면의 흐름부터, 소리의 디테일까지.', font=f1, fill='#FBF9F6')
d.text((80, 150 + lh + 120), '유튜브 롱폼·쇼츠 편집 · 영화·웹콘텐츠 믹싱 · yeongungod.com', font=f2, fill='#8A837C')
d.rectangle((80, 150 + lh + 170, 136, 150 + lh + 174), fill='#9CC3D5')
im.save('public/og.png', optimize=True)
print('ok', im.size)
