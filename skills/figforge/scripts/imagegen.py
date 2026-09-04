#!/usr/bin/env python3
"""批量调用 OpenAI Images API 出候选图。

用法:
    python3 imagegen.py prompts.jsonl [--outdir DIR] [--model gpt-image-1] [--force]

prompts.jsonl 每行一个 JSON 对象:
    {"prompt": "...", "size": "1536x1024", "quality": "medium", "out": "cand-a.png"}

- size:    1024x1024 | 1536x1024 | 1024x1536
- quality: low | medium | high        (探索用 medium, 要嵌进终稿的素材用 high)
- out:     输出文件名, 相对 --outdir

环境变量:
    OPENAI_API_KEY   必需
    OPENAI_BASE_URL  可选, 走代理时设置 (默认 https://api.openai.com/v1)

只用标准库, 不装依赖。已存在的输出文件默认跳过 (加 --force 重出)。
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

VALID_SIZES = {"1024x1024", "1536x1024", "1024x1536"}
VALID_QUALITY = {"low", "medium", "high"}


def generate(prompt: str, size: str, quality: str, model: str, key: str, base: str) -> bytes:
    url = base.rstrip("/") + "/images/generations"
    body = {"model": model, "prompt": prompt, "size": size, "quality": quality, "n": 1}
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise RuntimeError(f"HTTP {e.code}: {detail}") from None

    item = data["data"][0]
    if "b64_json" in item:
        return base64.b64decode(item["b64_json"])
    if "url" in item:  # 部分代理只回 url
        with urllib.request.urlopen(item["url"], timeout=120) as resp:
            return resp.read()
    raise RuntimeError(f"响应里既没有 b64_json 也没有 url: {list(item)}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("jsonl", type=Path)
    ap.add_argument("--outdir", type=Path, default=Path("output/imagegen"))
    ap.add_argument("--model", default="gpt-image-1")
    ap.add_argument("--force", action="store_true", help="覆盖已存在的输出")
    args = ap.parse_args()

    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("错误: 未设置 OPENAI_API_KEY", file=sys.stderr)
        return 2
    base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

    args.outdir.mkdir(parents=True, exist_ok=True)
    jobs = [json.loads(l) for l in args.jsonl.read_text(encoding="utf-8").splitlines() if l.strip()]
    if not jobs:
        print("错误: jsonl 为空", file=sys.stderr)
        return 2

    failed = 0
    for i, job in enumerate(jobs, 1):
        out = args.outdir / job["out"]
        size = job.get("size", "1536x1024")
        quality = job.get("quality", "medium")
        if size not in VALID_SIZES or quality not in VALID_QUALITY:
            print(f"[{i}/{len(jobs)}] {out.name}: 非法 size/quality ({size}, {quality})", file=sys.stderr)
            failed += 1
            continue
        if out.exists() and not args.force:
            print(f"[{i}/{len(jobs)}] {out.name}: 已存在, 跳过")
            continue
        print(f"[{i}/{len(jobs)}] {out.name}: {size} {quality} ...", end="", flush=True)
        try:
            png = generate(job["prompt"], size, quality, args.model, key, base)
        except Exception as e:  # noqa: BLE001
            print(f" 失败: {e}")
            failed += 1
            continue
        out.write_bytes(png)
        print(f" {len(png) // 1024} KB")

    print(f"\n完成: {len(jobs) - failed}/{len(jobs)} → {args.outdir}/")
    print("下一步: 逐字核对图里的文字, 挑构图, 然后用代码重做 (references/imagegen.md)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
