"""从图像模型生成的中介图里抠出三个素材（螺丝钉 / 挖掘机 / 面盘），给 JSX 拼版用。

    uv run --no-project --with scipy --with pillow --with numpy python cut_assets.py

思路：青色箭头按色键抹白；白底四周泛洪当背景；只保留最大连通块（甩掉虚线、系数文字的碎片）；
alpha 收 1px 再羽化，避免白边。
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage

SRC = 'source/mediation-photo.png'
JOBS = {  # 名字: (裁剪框, 需要抹白的矩形)。两者都是原图坐标，方便对着原图定位
    'screw':     ((15, 365, 445, 530),   [(375, 500, 445, 530)]),                        # 右下角的虚线头
    'excavator': ((700, 5, 1320, 425),   [(1080, 170, 1176, 305)]),                      # 铲斗的半透明残影
    'pasta':     ((1380, 195, 2061, 650), [(1380, 515, 1505, 545), (1590, 584, 1975, 650)]),  # 左侧虚线头；底部标签文字
}

src = Image.open(SRC).convert('RGB')
a = np.asarray(src).astype(int)
teal = (a[:, :, 1] - a[:, :, 0] > 25) & (a[:, :, 2] - a[:, :, 0] > 15) & (a[:, :, 0] < 215)
teal = ndimage.binary_dilation(teal, iterations=2)
a[teal] = 255
base = Image.fromarray(a.astype('uint8'))

def cut(name, box, whiteout):
    im = base.crop(box)
    d = ImageDraw.Draw(im)
    for (x0, y0, x1, y1) in whiteout:
        d.rectangle((x0 - box[0], y0 - box[1], x1 - box[0], y1 - box[1]), fill=(255, 255, 255))
    px = np.asarray(im).astype(int)
    bg = px.min(axis=2) > 232
    lab, _ = ndimage.label(bg)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    lab2, n2 = ndimage.label(fg)
    sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
    keep = lab2 == (1 + int(np.argmax(sizes)))
    alpha = Image.fromarray((keep * 255).astype('uint8'))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA')
    out.putalpha(alpha)
    out = out.crop(alpha.getbbox())
    out.save(f'assets/{name}.png')
    print(f'{name}: {im.size} → {out.size}, 丢弃碎片 {[int(s) for s in sorted(sizes, reverse=True)[1:5]]}')

for k, (box, wo) in JOBS.items():
    cut(k, box, wo)
