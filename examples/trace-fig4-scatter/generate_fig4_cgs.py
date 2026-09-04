#!/usr/bin/env python3
"""Generate Figure 4: CGS vs Recall@1 scatter plot.

Uses hardcoded values from Table 6 (main results) to ensure consistency.

Layout strategy: full manual placement (no adjustText). Each label's
position is hand-chosen so that, for any two labels in the same crowded
zone, their left-to-right order matches the left-to-right order of their
data points. This is the only way to guarantee zero leader-line crossings
in a 13-label scatter where multiple points are collocated.

Leader-line rule: drawn only when the label is more than ~0.005 data-units
away from its dot. Adjacent labels get a small offset and no arrow.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from pathlib import Path

# V5 open-set data (1,000-dialogue subset, gpt-5.4-mini, ~50--100 candidates
# per query from the 2,400-POI knowledge base). CGS = GS x min(1, CD/0.05) x
# (0.5 + 0.5 x PC), computed from the per-baseline open-set raw outputs.
BASELINES = {
    # Non-LLM baselines
    'Popularity':        {'r1': 0.012, 'cgs': 0.802, 'llm': False},
    'TF-IDF':            {'r1': 0.099, 'cgs': 0.772, 'llm': False},
    'Aspect':            {'r1': 0.017, 'cgs': 0.737, 'llm': False},
    'Dense':             {'r1': 0.033, 'cgs': 0.855, 'llm': False},
    'Spatial':           {'r1': 0.099, 'cgs': 0.726, 'llm': False},
    'Hybrid-RRF':        {'r1': 0.078, 'cgs': 0.772, 'llm': False},
    'Itinerary':         {'r1': 0.099, 'cgs': 0.679, 'llm': False},
    'Knowledge-Enh.':    {'r1': 0.052, 'cgs': 0.698, 'llm': False},
    'Persona-Ground.':   {'r1': 0.018, 'cgs': 0.724, 'llm': False},
    # LLM baselines (v5: gpt-5.4-mini)
    'LLM Zero-Shot':     {'r1': 0.132, 'cgs': 0.591, 'llm': True},
    'DST':               {'r1': 0.125, 'cgs': 0.586, 'llm': True},
    'RAG-Citation':      {'r1': 0.093, 'cgs': 0.630, 'llm': True},
    'Multi-Rev. Synth.': {'r1': 0.100, 'cgs': 0.196, 'llm': True},
}

NON_LLM_COLOR = '#2196F3'
LLM_COLOR = '#D32F2F'

# X-jitter for the three points tied at R@1 = 0.099 so they don't sit in the
# same column. Sorted left-to-right: TF-IDF, Spatial, Itinerary.
JITTER = {
    'TF-IDF':    -0.0030,
    'Spatial':    0.0000,
    'Itinerary':  0.0030,
}

# Manual label placement. Each entry is (x, y, ha, va, draw_leader).
# Layout invariant: in any crowded zone, the left-to-right ordering of
# labels matches the left-to-right ordering of their dots. This rules out
# leader-line crossings by construction.
#
# - Top-left cluster (R@1 < 0.06): labels splayed up / down / sideways
#   from each dot in distinct directions.
# - Mid stack at R@1 ≈ 0.099 (TF-IDF / Spatial / Itinerary): TF-IDF up,
#   Spatial right, Itinerary down — three different quadrants.
# - Right cluster (RAG-Citation, DST, LLM Zero-Shot): RAG-Citation goes
#   LEFT (its dot is leftmost), DST goes DOWN, Zero-Shot goes UP. By
#   placing RAG-Citation's label to the LEFT of its dot we eliminate the
#   leader-line crossing with Itinerary's down-going arrow.
LABELS = {
    # name             :  (x_label, y_label,  ha,       va,       arrow)
    'Popularity':         (0.012,   0.842,    'center', 'bottom', False),  # straight up of (0.012, 0.802)
    'Aspect':             (0.017,   0.778,    'center', 'bottom', False),  # straight up of (0.017, 0.737)
    'Persona-Ground.':    (0.018,   0.685,    'center', 'top',    False),  # straight down of (0.018, 0.724)
    'Dense':              (0.043,   0.858,    'left',   'center', False),  # right of (0.033, 0.855)
    'Knowledge-Enh.':     (0.062,   0.698,    'left',   'center', False),  # right of (0.052, 0.698)
    'Hybrid-RRF':         (0.069,   0.772,    'right',  'center', False),  # LEFT of dot (0.078, 0.772) — no arrow
    'TF-IDF':             (0.085,   0.870,    'center', 'bottom', True),   # ABOVE-LEFT — clears Hybrid-RRF and Spatial; arrow goes diag down-right to dot at (0.096, 0.772)
    'Spatial':            (0.108,   0.733,    'left',   'center', True),   # right of Spatial dot at (0.099, 0.726)
    'Itinerary':          (0.1075,  0.660,    'left',   'center', True),   # right of Itinerary dot at (0.102, 0.679)
    'RAG-Citation':       (0.078,   0.620,    'right',  'center', True),   # LEFT of (0.093, 0.630) — keeps leader from crossing Itinerary's
    'DST':                (0.125,   0.550,    'center', 'top',    True),   # down of (0.125, 0.586)
    'LLM Zero-Shot':      (0.132,   0.628,    'center', 'bottom', False),  # up of (0.132, 0.591)
    'Multi-Rev. Synth.':  (0.100,   0.232,    'center', 'bottom', False),  # up of (0.100, 0.196), no neighbours
}


def main():
    output_dir = Path('paper/figures')
    output_dir.mkdir(exist_ok=True)

    fig, ax = plt.subplots(figsize=(12, 7.0))

    # Plot dots with jitter.
    point_xy = {}
    for name, data in BASELINES.items():
        x = data['r1'] + JITTER.get(name, 0.0)
        y = data['cgs']
        point_xy[name] = (x, y)
        color = LLM_COLOR if data['llm'] else NON_LLM_COLOR
        marker = 's' if data['llm'] else 'o'
        ax.scatter(x, y, c=color, marker=marker, s=160, zorder=5,
                   edgecolors='white', linewidth=1.0)

    # Draw labels and (optionally) leader lines.
    for name, (lx, ly, ha, va, draw_leader) in LABELS.items():
        if name not in BASELINES:
            continue
        dx, dy = point_xy[name]
        color = LLM_COLOR if BASELINES[name]['llm'] else NON_LLM_COLOR
        if draw_leader:
            ax.annotate(
                name,
                xy=(dx, dy),
                xytext=(lx, ly),
                fontsize=12,
                ha=ha,
                va=va,
                color=color,
                fontweight='bold',
                arrowprops=dict(arrowstyle='-', color='dimgray', lw=0.6,
                                shrinkA=2, shrinkB=8, alpha=0.7),
                zorder=6,
            )
        else:
            ax.text(lx, ly, name, fontsize=12, ha=ha, va=va,
                    color=color, fontweight='bold', zorder=6)

    legend_elements = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor=NON_LLM_COLOR,
               markersize=12, label='Non-LLM (retrieval / template)',
               markeredgecolor='white', markeredgewidth=1.0),
        Line2D([0], [0], marker='s', color='w', markerfacecolor=LLM_COLOR,
               markersize=12, label='LLM-based',
               markeredgecolor='white', markeredgewidth=1.0),
    ]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=13,
              frameon=True, framealpha=0.95)

    ax.set_xlabel('Open-set Recall@1 $\\rightarrow$', fontsize=16)
    ax.set_ylabel('Open-set Composite Grounding Score (CGS) $\\rightarrow$', fontsize=16)
    ax.set_xlim(-0.025, 0.195)
    ax.set_ylim(0.05, 1.00)
    ax.grid(True, alpha=0.3)
    ax.set_title('Three-Competency Gap: Grounding $\\times$ Accuracy Projection '
                 '(Open-set, $\\sim$50–100 candidates)',
                 fontsize=15, fontweight='bold')
    ax.tick_params(axis='both', labelsize=13)

    fig.tight_layout()
    fig.savefig(output_dir / 'fig4_tradeoff.pdf', bbox_inches='tight', dpi=300)
    fig.savefig(output_dir / 'fig4_tradeoff.png', bbox_inches='tight', dpi=300)
    plt.close(fig)
    print(f'Figure 4 saved to {output_dir / "fig4_tradeoff.pdf"}')


if __name__ == '__main__':
    main()
