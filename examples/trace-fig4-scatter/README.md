# 案例：13 个 label 的散点图，零引线交叉

`fig4_tradeoff.png` 是 TRACE 论文的 Figure 4：14 个 baseline 在 Recall@1 × Grounding Score 平面上的分布，
每个点带名字。难点不在画点，在 13 个 label 挤在两个区域里怎么放。

## 三次尝试

| commit | 方法 | 结果 |
|---|---|---|
| `9ea8d35` | `adjustText` + x 方向 jitter | 仍有引线交叉，label 飘远 |
| `99477f7` | 去掉冗余底纹、缩短引线 | 好一点，没根治 |
| `b304cad` | **全手动坐标表** | 零交叉 |

## 方法

`generate_fig4_cgs.py` 顶部的 docstring 和 `LABELS` 字典是核心。一条不变量：

> 同一拥挤区内，label 的左右顺序 = 数据点的左右顺序。

满足它，引线在构造上就不会交叉。然后每个 label 选一个象限推出去，紧挨着点的不画引线。
每一行坐标后面都有注释说明为什么放这里。

完整方法论在 `../../skills/figforge/references/matplotlib-pub.md`。

## 运行

脚本把输出写到相对路径 `paper/figures/`（原项目的约定，未改动）：

```bash
mkdir -p paper/figures
uv run --with matplotlib generate_fig4_cgs.py
ls paper/figures/   # fig4_tradeoff.pdf  fig4_tradeoff.png
```

数据是硬编码的（对应论文 Table 6），所以不依赖任何实验目录。
