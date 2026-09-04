#!/usr/bin/env bash
# SVG → PDF, 并校验内嵌的 base64 图没有在转换中丢失。
#   scripts/svg2pdf.sh fig1.svg figures/fig1.pdf
#
# 为什么不用 inkscape: 它会静默丢掉 data:image/...;base64 的 <image>, PDF 里照片消失。
set -euo pipefail

in=${1:?用法: svg2pdf.sh in.svg out.pdf}
out=${2:?用法: svg2pdf.sh in.svg out.pdf}

command -v rsvg-convert >/dev/null || { echo "需要 rsvg-convert (apt install librsvg2-bin)" >&2; exit 1; }

mkdir -p "$(dirname "$out")"
rsvg-convert -f pdf "$in" -o "$out"

# grep 无匹配返回 1, 在 pipefail 下会杀掉脚本 — 用 { ...; || true; } 包住
n_svg=$({ grep -o 'data:image/[a-z]*;base64' "$in" || true; } | wc -l | tr -d ' ')
if command -v pdfimages >/dev/null; then
  n_pdf=$({ pdfimages -list "$out" 2>/dev/null || true; } | tail -n +3 | wc -l | tr -d ' ')
else
  n_pdf="?"
fi

size=$(du -h "$out" | cut -f1)
echo "✓ $out ($size)   base64 内嵌图 $n_svg 处 → PDF 图像对象 $n_pdf 个 (含 rsvg 光栅化的遮罩, 非一一对应)"

if [[ "$n_svg" -gt 0 && "$n_pdf" == "0" ]]; then
  echo "✗ SVG 里有 $n_svg 处内嵌图, PDF 里一张都没有 — 转换丢图了" >&2
  exit 2
fi
