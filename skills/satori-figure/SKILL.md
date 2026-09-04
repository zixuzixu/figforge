---
name: satori-figure
description: Generate publication-quality vector figures (teasers, schematics, dialogue / review layouts) by authoring JSX and rendering through Vercel Satori — producing SVG and PDF that plug into LaTeX/papers. Use this whenever the user wants to build or iterate on a diagrammatic figure that has text, highlighted quotes, boxes, cards, avatars, arrows, or legends and where hand-written SVG would be painful to maintain — especially for paper Figure 1 teasers, system diagrams, dialogue illustrations, annotation mock-ups, or anything where consistent alignment and right-edge flow matters. Trigger on phrases like "make a figure", "iterate on Figure 1", "build a teaser", "satori figure", "generate an SVG diagram", or when a user shows a rough figure and says "do this but in JSX / Satori".
---

# Satori-powered Figure Authoring

Generating a non-trivial paper figure by positioning SVG elements manually is a losing game: every spacing tweak cascades through dozens of coordinates. This skill replaces hand-SVG with a JSX → Satori pipeline: author Flexbox-like JSX, Satori rasterizes the layout into SVG, a post-processor injects arrows and the result gets converted to PDF for LaTeX.

## Workflow

1. **Scaffold** the skill's template into the project's `figures/` or `figures/candidates/` directory.
2. **Author** the JSX (`fig1.jsx` or similar): one component tree describing the figure, with inline style objects for typography & color.
3. **Run the render script** (`node render_fig1.mjs`): it compiles JSX, feeds it to Satori, and writes `fig1.svg`.
4. **Post-process**: the render script also injects arrows (if any) into the SVG by regex-matching known element fills.
5. **Convert to PDF**: `rsvg-convert -f pdf fig1.svg -o figures/fig1.pdf`.
6. **Verify** by rendering to PNG at ≥2000 wide and using Claude Vision or a viewer to inspect; iterate on JSX.
7. **Embed** in LaTeX: `\includegraphics[width=0.98\linewidth]{figures/fig1.pdf}`.

## Files in this skill

| Path | Purpose |
|------|---------|
| `scripts/render_template.mjs` | Render script to copy into the project. Handles esbuild compile → satori render → arrow injection → SVG file. |
| `assets/starter.jsx` | A ready-to-edit JSX starter using the JSX factory pattern and the canonical design tokens. |
| `references/gotchas.md` | Satori-specific pitfalls discovered during development. **Read this before authoring a skill-heavy figure.** |
| `references/design-defaults.md` | Default palette, typography, spacing for the "academic paper" aesthetic (and how to depart from it). |
| `references/patterns.md` | Reusable recipes: right-aligned bubble columns, inline-highlight-with-baseline, orthogonal arrow channel, star ratings, drawn avatars, review cards. |

## Setup once per project

```bash
# In the repo root
npm install --no-save satori esbuild
# Copy the skill's template files into the figures folder:
cp ~/.claude/skills/satori-figure/scripts/render_template.mjs  paper/figures/candidates/render_fig1.mjs
cp ~/.claude/skills/satori-figure/assets/starter.jsx           paper/figures/candidates/fig1.jsx
```

Fonts: the template loads **Lato** from `/usr/share/fonts/truetype/lato`. If Lato isn't installed, swap to Roboto (`/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF`) or any installed TTF. Do not rely on emoji fonts — Satori loads only the TTFs you give it.

## Default design choices

Apply these unless the figure topic demands something else — they produce a consistent academic-paper look that matches NeurIPS/ICLR style sensibilities.

- **Canvas**: 1664 wide (standard two-column spread width); let height auto-grow by NOT passing `height` to Satori.
- **Font stack**: `"Lato","Helvetica Neue",Arial,sans-serif` (load 4–5 weights plus italic).
- **Palette**: muted slate/sage/stone. See `references/design-defaults.md` for exact hex codes.
- **Borders**: 0.8–1.0 px; **radii** 8–12 px (not bubbly).
- **Labels** (T1 USER, SCENARIO, KB): 13–14 px weight 700 with `letter-spacing: 2.2–2.6` and `text-transform: uppercase`. This is the single biggest "academic feel" lever.
- **Secondary / side notes**: italic 13–14 px at `color: #4a5568` (slate-600).
- **Arrows**: post-injected, stroke-width ~3, `stroke-dasharray: "9 5"`, color deep green `#1e6537` (contrasts with sage highlights).
- **Highlights**: `background: #d3e4c7`; `padding: '0 6px'` (horizontal only); parent Row uses `alignItems: 'baseline'` and matching `lineHeight` (typically `1.5`).

## Iteration strategy

Strong iteration discipline matters because a figure this dense takes 5–10 render-compare cycles. Use this loop:

1. **Change one thing** (a color token, a bubble width, a quote split). Keep diffs small.
2. **Re-render**: `node render_fig1.mjs`. Should take <2s.
3. **Compare at 2×**: `rsvg-convert -w 2400 fig1.svg -o /tmp/check.png`, then split into TL/TR/BL/BR quadrants with Python+PIL and examine at full resolution. Don't eyeball the thumbnail.
4. **Regression-check edge cases**: content overflow, right-edge alignment between parallel elements (bubbles, cards), baseline consistency for highlight vs text.
5. **Regenerate PDF only when happy**: `rsvg-convert -f pdf fig1.svg -o figures/fig1.pdf`, then `pdflatex main.tex`.

Common iteration triggers that should flag alarm bells:

| Symptom | Root cause | Look at |
|---|---|---|
| Emoji/glyph box (tofu) | Font doesn't include that Unicode range | `references/gotchas.md#emoji` |
| Highlight floats above baseline | Row uses `alignItems: 'center'` with padded Hi | `references/gotchas.md#highlight-baseline` |
| Arrow cuts through bubble | Channel X is inside a container | Pin it to phone/KB gap constant |
| One line way shorter than another | Manual wrap didn't balance; flex-wrap doesn't split mid-highlight | Re-split OR append dim trailing phrase |
| Card right-whitespace inconsistent top vs bottom | Center-block with fixed inner width + variable content | Use `width:'100%'` + symmetric padding |

## Minimal one-shot example

If the user has a rough sketch image and wants a "Satori-ify this", drop in the starter, adjust the `<Fig>` default export, and render:

```bash
cd <project>
cp ~/.claude/skills/satori-figure/assets/starter.jsx figures/fig1.jsx
cp ~/.claude/skills/satori-figure/scripts/render_template.mjs figures/render_fig1.mjs
node figures/render_fig1.mjs
rsvg-convert -f pdf figures/fig1.svg -o figures/fig1.pdf
```

Then edit `figures/fig1.jsx` in-place; each render is fast.

## When NOT to use this skill

- **Pure TikZ diagrams** (math, graphs, commutative diagrams) — TikZ is better.
- **Plots from data** — matplotlib / seaborn / vega.
- **Single-element SVG** (an icon, one arrow) — raw SVG is simpler.
- **Interactive figures** — Satori only outputs static SVG.

This skill shines for **layout-heavy figures with text flow, alignment, highlights, and multi-row/column structure** — teasers, annotated dialogue mock-ups, before/after UIs, pipeline cards, legend rows.
