#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["pillow>=10"]
# ///
"""把图渲染成 2× PNG 并切成四象限, 供逐块检查。

用法:
    uv run inspect_figure.py fig1.svg [--width 2400] [--outdir /tmp/inspect]
    uv run inspect_figure.py preview.png

SVG 通过 rsvg-convert 光栅化; PNG 直接用。输出:
    <outdir>/<stem>_full.png     完整 2× 图
    <outdir>/<stem>_TL.png       左上  (带 5% 重叠, 边缘不漏)
    <outdir>/<stem>_TR.png       右上
    <outdir>/<stem>_BL.png       左下
    <outdir>/<stem>_BR.png       右下

然后一块一块看 (在 Claude Code 里直接 Read 这些 PNG)。
"""
import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

OVERLAP = 0.05


def rasterize_svg(svg: Path, width: int, out_png: Path) -> None:
    if not shutil.which("rsvg-convert"):
        sys.exit("需要 rsvg-convert (apt install librsvg2-bin)")
    subprocess.run(["rsvg-convert", "-w", str(width), str(svg), "-o", str(out_png)], check=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("--width", type=int, default=2400, help="SVG 光栅化宽度 (默认 2400 ≈ 2×)")
    ap.add_argument("--outdir", type=Path, default=Path("/tmp/inspect"))
    args = ap.parse_args()

    args.outdir.mkdir(parents=True, exist_ok=True)
    stem = args.src.stem
    full = args.outdir / f"{stem}_full.png"

    if args.src.suffix.lower() == ".svg":
        rasterize_svg(args.src, args.width, full)
    elif args.src.suffix.lower() == ".png":
        shutil.copy(args.src, full)
    else:
        sys.exit(f"只支持 .svg / .png, 收到 {args.src.suffix}")

    im = Image.open(full)
    w, h = im.size
    ox, oy = int(w * OVERLAP), int(h * OVERLAP)
    mx, my = w // 2, h // 2
    quads = {
        "TL": (0, 0, mx + ox, my + oy),
        "TR": (mx - ox, 0, w, my + oy),
        "BL": (0, my - oy, mx + ox, h),
        "BR": (mx - ox, my - oy, w, h),
    }
    print(f"{full}  ({w}×{h}, {full.stat().st_size // 1024} KB)")
    for name, box in quads.items():
        p = args.outdir / f"{stem}_{name}.png"
        im.crop(box).save(p)
        print(f"{p}  ({box[2]-box[0]}×{box[3]-box[1]})")
    if w < 2000:
        print(f"\n提示: 宽度 {w} < 2000, 细节可能看不清; SVG 用 --width 2400 以上", file=sys.stderr)


if __name__ == "__main__":
    main()
