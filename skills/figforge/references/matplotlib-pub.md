# 数据图发表规范（matplotlib）

数据图的难点从来不是画出来，而是**label 不打架、颜色有语义、尺寸进论文刚好**。

## 尺寸与输出

| 用途 | `figsize` | 说明 |
|---|---|---|
| 单栏 | `(5.2, 3.6)` | 对应 `\linewidth` ≈ 3.3 in，留字号余量 |
| 双栏通栏 | `(12, 4.5)` 或 `(12, 7)` | 后者用于 label 多的散点 |
| 正方形 | `(6, 6)` | 相关性、混淆矩阵 |

```python
fig.savefig(out / 'fig4.pdf', bbox_inches='tight', dpi=300)   # LaTeX 用
fig.savefig(out / 'fig4.png', bbox_inches='tight', dpi=300)   # 海报 / 社媒 / 看图
```

PDF 是矢量，`\includegraphics` 缩放不糊。PNG 只是副产品。

## 基线样式

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

plt.rcParams.update({
    'font.size': 12,
    'axes.labelsize': 14, 'axes.labelweight': 'bold',
    'axes.spines.top': False, 'axes.spines.right': False,
    'legend.frameon': True, 'legend.framealpha': 0.9,
})
ax.grid(True, alpha=0.3)
```

## 颜色：语义配对，不超过三个色相

一张图里的颜色要能用一句话解释："蓝 = 非 LLM，红 = LLM"。

```python
NON_LLM_COLOR = '#2196F3'
LLM_COLOR     = '#F44336'
```

类别同时用**颜色 + marker 形状**双编码（圆 vs 方），黑白打印也能分。
区域底纹用同色 `alpha=0.15` 的矩形，区域标签放矩形角落而不是中央（中央会压数据点）。

## Label 放置：手动，不信 adjustText

这是数据图里最耗时间、也最值得花时间的一步。TRACE Fig 4 有 13 个 label，三次 commit 的演进：

| 尝试 | 方法 | 结果 |
|---|---|---|
| 1 | `adjustText` + x 方向 jitter | 仍有 3 处引线交叉，label 飘到离点很远的地方 |
| 2 | 去掉冗余底纹、缩短引线 | 交叉少了但没消除 |
| 3 | **全手动坐标表** | 零交叉 |

手动放置的核心不是"一个个试"，而是一条**不变量**：

> 在任何一个拥挤区域内，label 的左右顺序 = 对应数据点的左右顺序。

满足这条，引线在构造上就不可能交叉。剩下的只是把每个 label 推到它的点的哪个象限。

### 坐标表结构

```python
# name: (x_label, y_label, ha, va, draw_leader)
LABELS = {
    'Popularity':   (0.012, 0.842, 'center', 'bottom', False),  # 正上方，近，不画引线
    'Dense':        (0.058, 0.870, 'left',   'center', True),   # 右上，远，画引线
    'RAG-Citation': (0.070, 0.610, 'right',  'center', True),   # 放左边！避开 Itinerary 向下的引线
    ...
}
```

每一行都要有注释说明**为什么放这里**。三个月后改数据时这些注释就是你的导航。

### 引线规则

- label 离点 > 0.005 数据单位才画引线；紧挨着的不画（画了反而乱）
- 引线 `arrowstyle='-'`（无箭头）、`lw=0.6`、`color='dimgray'`、`alpha=0.7`——它是辅助，不是主角
- `shrinkA=2, shrinkB=8`：引线两端各留空，不贴着文字和点

### 重合点

三个点 x 完全相同（都是 0.099）→ 加 `JITTER = {'TF-IDF': -0.003, 'Spatial': 0, 'Itinerary': +0.003}`，
画点和放 label 都用抖动后的坐标。抖动量要小到读者看不出、大到点不重叠。

### 代码骨架

```python
for name, (lx, ly, ha, va, leader) in LABELS.items():
    dx, dy = point_xy[name]
    if leader:
        ax.annotate(name, xy=(dx, dy), xytext=(lx, ly), ha=ha, va=va,
                    fontsize=12, fontweight='bold', color=color_of[name],
                    arrowprops=dict(arrowstyle='-', color='dimgray', lw=0.6,
                                    shrinkA=2, shrinkB=8, alpha=0.7), zorder=6)
    else:
        ax.text(lx, ly, name, ha=ha, va=va, fontsize=12,
                fontweight='bold', color=color_of[name], zorder=6)
```

完整可运行版本：`examples/trace-fig4-scatter/generate_fig4_cgs.py`。

## 数据来源：终稿硬编码

论文终稿的图，数据直接写在脚本顶部的字典里，并注明来自哪张表：

```python
# V5 open-set data, matches Table 6. CGS = GS × min(1, CD/0.05) × (0.5 + 0.5×PC)
BASELINES = {
    'Popularity': {'r1': 0.012, 'cgs': 0.802, 'llm': False},
    ...
}
```

原因：图和表必须一致，审稿人会对。硬编码 + 注释比"从 results.json 读"更可审计，
也不会因为实验目录变动就画不出来。探索阶段随便读文件，定稿前换成硬编码。

## 中文

论文数据图不放中文。海报或社媒版需要中文时：

```python
plt.rcParams['font.sans-serif'] = ['Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False
```
