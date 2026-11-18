#!/usr/bin/env python3
"""Generate the Genes Consulting logo: the mark alone (SVG + PNG fallback) and the favicon set.

The name "Genes Consulting" is never part of the artwork: the site sets it as live text beside the mark.

Usage: python3 scripts/logo/build_logo.py
Needs: cairosvg, pillow.
Colors are Tailwind v4 default palette values only (see docs/design/brand-colors.md).
"""
import math, sys, os
import cairosvg
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "brand")

# Tailwind v4 default palette
C = dict(sky400="#00bcff", sky500="#00a6f4", sky600="#0084d1", sky700="#0069a8",
         sky900="#024a70", sky950="#052f4a", slate300="#cad5e2", slate600="#45556c",
         yellow600="#d08700", white="#ffffff")

# Geometry on a 5x5 grid, 1 cell = U = 100 units. All arcs are centred on the bottom-right corner.
U = 100
N = 5 * U                    # the mark is a 5x5 square
CR = 6                       # corner radius of the flat ends
CX = CY = N
T = 85                       # arc thickness (C and G arcs, and the width of the terminal)
GAP = 30                     # gap between the C and G arcs
R1o, R1i = N, N - T          # C arc
R2o = R1i - GAP              # G arc
R2i = R2o - T
DR = 2 * U                   # radius of the bar-and-terminal piece (2 cells)
NOTCH = T                    # notch under the bar is a T x T square; bar line meets the diagonal at (N-T, N-T)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def ring(ro, ri, c=CR):
    sq = lambda r: math.sqrt(r * r - c * c)
    p = [f"M{f(CX - sq(ro))} {f(CY - c)}",
         f"A{ro} {ro} 0 0 1 {f(CX - c)} {f(CY - sq(ro))}",
         f"Q{CX} {f(CY - ro)} {CX} {f(CY - ro + c)}"]
    if ri > 0:
        p += [f"L{CX} {f(CY - ri - c)}",
              f"Q{CX} {f(CY - ri)} {f(CX - c)} {f(CY - sq(ri))}",
              f"A{ri} {ri} 0 0 0 {f(CX - sq(ri))} {f(CY - c)}",
              f"Q{f(CX - ri)} {CY} {f(CX - ri - c)} {CY}"]
    else:
        p += [f"L{CX} {f(CY - c)}", f"Q{CX} {CY} {f(CX - c)} {CY}"]
    p += [f"L{f(CX - ro + c)} {CY}", f"Q{f(CX - ro)} {CY} {f(CX - sq(ro))} {f(CY - c)}Z"]
    return "".join(p)


def bar_terminal(c=CR):
    """Quarter disc (radius DR) with a T x T notch cut from its bottom-left: the G's bar and terminal."""
    sq = lambda r: math.sqrt(r * r - c * c)
    ny, sx = CY - NOTCH, CX - NOTCH
    lx = CX - math.sqrt(DR * DR - NOTCH * NOTCH)   # where the arc meets the bar line
    return (f"M{f(lx)} {ny}A{DR} {DR} 0 0 1 {f(CX - c)} {f(CY - sq(DR))}"
            f"Q{CX} {f(CY - DR)} {CX} {f(CY - DR + c)}L{CX} {CY - c}Q{CX} {CY} {CX - c} {CY}"
            f"L{sx + c} {CY}Q{sx} {CY} {sx} {CY - c}L{sx} {ny}Z")


def mark_group(cols, tx=0, ty=0, s=1):
    paths = (f'<path fill="{cols[0]}" d="{ring(R1o, R1i)}"/>'
             f'<path fill="{cols[1]}" d="{ring(R2o, R2i)}"/>'
             f'<path fill="{cols[2]}" d="{bar_terminal()}"/>')
    return f'<g transform="translate({tx} {ty}) scale({s})">{paths}</g>'


def svg(w, h, body, bg=None, title="Genes Consulting"):
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{bgr}{body}</svg>\n')


def main():
    os.makedirs(OUT, exist_ok=True)
    # C arc, G arc, bar and terminal (gold accent)
    cols_dark = [C["sky400"], C["sky500"], C["yellow600"]]
    cols_light = [C["sky500"], C["sky600"], C["yellow600"]]
    mark_dark = svg(N, N, mark_group(cols_dark))
    mark_light = svg(N, N, mark_group(cols_light))

    # favicon: the mark alone on a transparent background. Browsers that support it switch to the
    # dark colours when the tab bar is dark; PNG and ICO use the light colours.
    css = (f'<style>.c{{fill:{C["sky500"]}}}.g{{fill:{C["sky600"]}}}.t{{fill:{C["yellow600"]}}}'
           f'@media (prefers-color-scheme:dark){{.c{{fill:{C["sky400"]}}}.g{{fill:{C["sky500"]}}}}}</style>')
    fav_body = (f'<path class="c" d="{ring(R1o, R1i)}"/><path class="g" d="{ring(R2o, R2i)}"/>'
                f'<path class="t" d="{bar_terminal()}"/>')
    favicon = svg(N, N, css + fav_body)

    for n, c in {"mark-dark.svg": mark_dark, "mark-light.svg": mark_light}.items():
        open(os.path.join(OUT, n), "w").write(c)
    open(os.path.join(ROOT, "public", "favicon.svg"), "w").write(favicon)

    def render(svg_str, path, size):
        cairosvg.svg2png(bytestring=svg_str.encode(), write_to=path, output_width=size, output_height=size)

    # PNG fallbacks for the site (2x of the largest rendered size)
    render(mark_light, os.path.join(OUT, "mark-light.png"), 256)
    render(mark_dark, os.path.join(OUT, "mark-dark.png"), 256)
    # favicon rasters, transparent
    pub = os.path.join(ROOT, "public")
    for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        render(mark_light, os.path.join(pub, name), size)
    ims = []
    for sz in (16, 32, 48):
        p = os.path.join(OUT, f"_f{sz}.png")
        render(mark_light, p, sz)
        ims.append(Image.open(p).convert("RGBA"))
    ims[2].save(os.path.join(pub, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
    for sz in (16, 32, 48):
        os.remove(os.path.join(OUT, f"_f{sz}.png"))
    print("done")


if __name__ == "__main__":
    main()
