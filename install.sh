#!/usr/bin/env bash
# 把 skills/ 下的每个 skill 以 symlink 装进 Claude Code 的 skills 目录。
#   ./install.sh                      → ~/.claude/skills/
#   CLAUDE_SKILLS_DIR=... ./install.sh
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
DEST=${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}
mkdir -p "$DEST"
for d in "$HERE"/skills/*/; do
  d=${d%/}; name=$(basename "$d"); target="$DEST/$name"
  if [ -e "$target" ] && [ ! -L "$target" ]; then
    echo "✗ $target 已存在且不是 symlink — 先移走: mv '$target' ~/.claude/skills-src/${name}.bak" >&2
    continue
  fi
  ln -sfn "$d" "$target"
  echo "✓ $target → $d"
done
echo "重启 Claude Code 会话后生效。"
