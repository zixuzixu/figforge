"""Satori 不认 .ttc，把系统 Noto Sans CJK SC 的 Regular/Bold 抽成单个 .otf 放到 fonts/。

    uv run --no-project --with fonttools python extract_fonts.py
"""
from fontTools.ttLib import TTCollection
for w in ('Regular', 'Bold'):
    coll = TTCollection(f'/usr/share/fonts/opentype/noto/NotoSansCJK-{w}.ttc')
    names = [f['name'].getDebugName(1) for f in coll.fonts]
    coll.fonts[names.index('Noto Sans CJK SC')].save(f'fonts/NotoSansCJKsc-{w}.otf')
    print('fonts/NotoSansCJKsc-%s.otf' % w)
