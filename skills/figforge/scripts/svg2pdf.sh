#!/usr/bin/env bash
# SVG → PDF, 并校验内嵌的 base64 图没有在转换中丢失。
#   scripts/svg2pdf.sh fig1.svg figures/fig1.pdf
#   scripts/svg2pdf.sh fig1.svg figures/fig1.pdf --strip-masks   # Satori 输出推荐
#
# 为什么不用 inkscape: 它会静默丢掉 data:image/...;base64 的 <image>, PDF 里照片消失。
#
# --strip-masks: 剥掉 Satori 给每个圆角容器套的 overflow mask (satori_om-*)。
#   rsvg-convert 会把每个带 mask 的组光栅化成一对页面大小的 image+smask, PDF 膨胀 2-3×。
#   没有东西真正溢出时剥掉它渲染完全一致 (实测像素差 0.01%)。
#   但依赖 overflow:hidden 裁切的元素 (如半颗星) 会坏 — 剥之前用 inspect_figure.py 对比一次。
set -euo pipefail

strip=0; args=()
for a in "$@"; do
  if [[ $a == --strip-masks ]]; then strip=1; else args+=("$a"); fi
done
in=${args[0]:?用法: svg2pdf.sh in.svg out.pdf [--strip-masks]}
out=${args[1]:?用法: svg2pdf.sh in.svg out.pdf [--strip-masks]}

command -v rsvg-convert >/dev/null || { echo "需要 rsvg-convert (apt install librsvg2-bin)" >&2; exit 1; }

src=$in
if (( strip )); then
  tmp=$(mktemp --suffix=.svg); trap 'rm -f "$tmp"' EXIT
  sed 's/ mask="url(#satori_om-id[^"]*)"//g' "$in" > "$tmp"
  n_masks=$({ grep -o 'mask="url(#satori_om-id' "$in" || true; } | wc -l | tr -d ' ')
  src=$tmp
fi

mkdir -p "$(dirname "$out")"
rsvg-convert -f pdf "$src" -o "$out"

# grep 无匹配返回 1, 在 pipefail 下会杀掉脚本 — 用 { ...; || true; } 包住
n_svg=$({ grep -o 'data:image/[a-z]*;base64' "$in" || true; } | wc -l | tr -d ' ')
if command -v pdfimages >/dev/null; then
  n_pdf=$({ pdfimages -list "$out" 2>/dev/null || true; } | tail -n +3 | wc -l | tr -d ' ')
else
  n_pdf="?"
fi

size=$(du -h "$out" | cut -f1)
echo "✓ $out ($size)   base64 内嵌图 $n_svg 处 → PDF 图像对象 $n_pdf 个"
(( strip )) && echo "  已剥离 $n_masks 处 Satori overflow mask 引用"

if [[ "$n_svg" -gt 0 && "$n_pdf" == "0" ]]; then
  echo "✗ SVG 里有 $n_svg 处内嵌图, PDF 里一张都没有 — 转换丢图了" >&2
  exit 2
fi
if (( ! strip )) && [[ "$n_pdf" != "?" ]] && (( n_pdf > 100 )); then
  echo "  提示: 图像对象 > 100, 多半是 Satori 的 overflow mask 被光栅化了; 试试 --strip-masks" >&2
fi
