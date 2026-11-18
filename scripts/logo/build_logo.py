#!/usr/bin/env python3
"""Generate the Genes Consulting logo SVGs (mark, wordmark, favicon) and PNG previews.

Usage: python3 scripts/logo/build_logo.py <NotoSans-Bold.woff> <NotoSans-Light.woff>
Needs: fonttools, cairosvg, pillow. Text is converted to paths, so the SVGs need no font.
Colors are Tailwind v4 default palette values only (see docs/design/brand-colors.md).
"""
import math, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import cairosvg
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "brand")
PREV = os.path.join(ROOT, "docs", "design", "logo")

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


def text_path(font, text, size, x, y, tracking=0.0):
    """Return (svg path d, advance width) for text set from baseline-left (x, y)."""
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    sc, pen_x, d = size / upm, x, []
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, pen_x, y)))
        d.append(pen.getCommands())
        pen_x += gs[g].width * sc + (tracking if i < len(text) - 1 else 0)
    return "".join(d), pen_x - x


def svg(w, h, body, bg=None, title="Genes Consulting"):
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{bgr}{body}</svg>\n')


def main(bold_path, light_path):
    bold, light = TTFont(bold_path), TTFont(light_path)
    os.makedirs(OUT, exist_ok=True); os.makedirs(PREV, exist_ok=True)
    # C arc, G arc, bar and terminal (gold accent)
    cols_dark = [C["sky400"], C["sky500"], C["yellow600"]]
    cols_light = [C["sky500"], C["sky600"], C["yellow600"]]
    S = N
    pad = 20

    # wordmark geometry
    gap = 0.28 * S
    cap = 0.32 * S
    size_g = cap / 0.714
    tx = S + gap
    top = 0.16 * S
    base_g = top + cap
    gd, gw = text_path(bold, "GENES", size_g, tx, base_g)
    size_c = size_g * 0.78
    # tracking so CONSULTING is as wide as GENES
    _, w0 = text_path(light, "CONSULTING", size_c, tx, 0)
    size_c *= 0.8 * gw / w0          # natural width = 80% of GENES, tracking fills the rest
    _, w0 = text_path(light, "CONSULTING", size_c, tx, 0)
    tr = (gw - w0) / 9
    base_c = base_g + 0.26 * S + size_c * 0.714 * 0 + 0.0
    base_c = base_g + 0.13 * S + size_c * 0.714
    cd, cw = text_path(light, "CONSULTING", size_c, tx, base_c, tr)
    W = int(tx + gw) + 0
    H = S

    def wordmark(cols, c1, c2):
        return (mark_group(cols) + f'<path fill="{c1}" d="{gd}"/><path fill="{c2}" d="{cd}"/>')

    files = {
        "mark-dark.svg": svg(S, S, mark_group(cols_dark), title="Genes Consulting"),
        "mark-light.svg": svg(S, S, mark_group(cols_light), title="Genes Consulting"),
        "logo-dark.svg": svg(W, H, wordmark(cols_dark, C["white"], C["slate300"])),
        "logo-light.svg": svg(W, H, wordmark(cols_light, C["sky900"], C["slate600"])),
    }
    # favicon: mark on a sky-950 rounded square
    fs = 256
    ms = 0.62 * fs / S
    off = (fs - S * ms) / 2
    fav = (f'<rect width="{fs}" height="{fs}" rx="56" fill="{C["sky950"]}"/>' + mark_group(cols_dark, off, off, ms))
    files["favicon.svg"] = svg(fs, fs, fav)
    for n, c in files.items():
        open(os.path.join(OUT, n), "w").write(c)
    open(os.path.join(ROOT, "public", "favicon.svg"), "w").write(files["favicon.svg"])

    # PNG: previews with backgrounds, favicon sizes
    def png(name, s, scale, bg=None, w=None):
        cairosvg.svg2png(bytestring=s.encode(), write_to=os.path.join(PREV, name), scale=scale)
    pw, ph = W + 2 * 120, H + 2 * 120
    prev_light = svg(pw, ph, f'<g transform="translate(120 120)">{wordmark(cols_light, C["sky900"], C["slate600"])}</g>', bg=C["white"])
    prev_dark = svg(pw, ph, f'<g transform="translate(120 120)">{wordmark(cols_dark, C["white"], C["slate300"])}</g>', bg=C["sky950"])
    png("logo-light-preview.png", prev_light, 1)
    png("logo-dark-preview.png", prev_dark, 1)
    png("mark-light-preview.png", svg(S + 240, S + 240, f'<g transform="translate(120 120)">{mark_group(cols_light)}</g>', bg=C["white"]), 1)
    png("mark-dark-preview.png", svg(S + 240, S + 240, f'<g transform="translate(120 120)">{mark_group(cols_dark)}</g>', bg=C["sky950"]), 1)
    # favicon / app icons
    fav_svg = files["favicon.svg"]
    for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        cairosvg.svg2png(bytestring=fav_svg.encode(), write_to=os.path.join(ROOT, "public", name), output_width=size, output_height=size)
    ims = []
    for s in (16, 32, 48):
        p = os.path.join(PREV, f"_f{s}.png")
        cairosvg.svg2png(bytestring=fav_svg.encode(), write_to=p, output_width=s, output_height=s)
        ims.append(Image.open(p).convert("RGBA"))
    ims[2].save(os.path.join(ROOT, "public", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
    for s in (16, 32, 48):
        os.remove(os.path.join(PREV, f"_f{s}.png"))
    print("done", W, H)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
