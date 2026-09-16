# -*- coding: utf-8 -*-
# tmp/work-img 원본 → public/images/work/*.jpg (폭 1280, 16:9 중앙 크롭)
from PIL import Image
import os
SRC = r'C:\Users\yeongungod\.claude\jobs\5205fbd7\tmp\work-img'
DST = r'public\images\work'
JOBS = {'chimmuk.webp':'chimmuk.jpg','saraji.png':'saraji.jpg','soulmate.png':'soulmate.jpg','onside-immacho.jpg':'onside.jpg'}
# onside 세로 포스터: 중앙 크롭이면 상단 "팬미팅" 타이틀이 "미팅"만 남고 잘림 → 위쪽으로 이동
TOP_RATIO = {'onside-immacho.jpg': 0.15}
for s, d in JOBS.items():
    im = Image.open(os.path.join(SRC, s)).convert('RGB')
    w, h = im.size
    tw, th = w, int(w * 9 / 16)
    if th > h:  # 너무 세로가 짧으면 폭을 줄인다
        th, tw = h, int(h * 16 / 9)
    top = int(h * TOP_RATIO[s]) if s in TOP_RATIO else (h - th) // 2
    box = ((w - tw) // 2, top, (w + tw) // 2, top + th)
    im = im.crop(box).resize((1280, 720), Image.LANCZOS)
    im.save(os.path.join(DST, d), quality=82, optimize=True)
    print(d, os.path.getsize(os.path.join(DST, d)) // 1024, 'KB')
