# Genes Consulting: brand colors and theme tokens

Status: draft for review. Replaces the default blue and emerald of shadcn preset `b2DcSAJ7K` with the Genes palette, for light and dark themes.

## 1. Where the colors come from

| Source | How the values were read | Reliability |
| --- | --- | --- |
| `GENES_Consulting_Presentazione_WOW.pptx` | Hex values read directly from the slide XML | Exact |
| `Banner aziendale Genes Consulting blu e ciano.png` | Sampled from pixels | Close, within a few units. The image has gradients and anti-aliasing |
| `Firma email aziendale GENES Consulting (4).jpg` | Sampled from pixels | Approximate. JPEG compression shifts values |

No brand manual is in the repository. If the client has one, its values should replace the sampled ones.

## 2. The palette

### Exact values from the presentation (dark theme)

| Hex | Name used here | Role in the deck | Count |
| --- | --- | --- | --- |
| `#071F37` | Navy 950 | Slide background (`#071F35` on slides 9 to 12, visually identical) | 13 slides |
| `#0C314D` | Navy 800 | Card and panel fill (`#0E334D` on slides 9 to 12) | 31 |
| `#347091` | Steel | Connector lines in the network graphic | 21 |
| `#14B5EB` | Cyan | Eyebrow labels, step numbers, card titles, footer rule, network nodes (`#15B3E4` on slides 9 to 12) | 64 |
| `#24C0CB` | Teal | Small decorations only: the short rule under each eyebrow and the dots at the top right | 33 |
| `#9ADFDA` | Mint | The smallest decoration dot, and the tagline once | 12 |
| `#B49E6F` | Gold | Every other node of the network graphic, nothing else | 9 |
| `#F7FAFC` | Off-white | Headings and body text (`#F5F8FB` on slides 9 to 12) | 54 |
| `#A9C1D0` | Mist | Secondary text: footer, captions, contact details (`#A9BFCC` on slides 9 to 12) | 32 |
| `#BED5E3` | Mist light | "CONSULTING" in the wordmark | 2 |
| `#FFFFFF` | White | "GENES" in the wordmark | 2 |

The small differences on slides 9 to 12 come from those slides being built separately. They are the same intent, so the site uses one value for each role.

### Sampled values from the banner and the signature (light theme)

| Hex (approx.) | Name used here | Role |
| --- | --- | --- |
| `#FFFFFF` | White | Page background |
| `#043D66` | Navy 700 | The large curved panel and the dark service cards in the banner |
| `#002C6C` to `#043878` | Royal navy | Headings, wordmark and body text on white. Slightly more blue than the panel navy |
| `#00B8F8` | Bright cyan | Logo arcs, highlighted words, short accent rules, vertical divider |
| `#0098E8` | Azure | The darker end of the cyan gradient in the logo arcs |
| `#E8F7FE` | Ice | Light card fill, wave at the bottom of the signature, large faded arcs |
| `#5080A8` | Slate blue | The subtitle line under the headline in the banner |

## 3. The pattern

Reading the three files together, the brand follows one consistent logic:

1. **Navy is the brand's body.** It is the full background on dark material and the text color on light material. It is never replaced by black or neutral grey. Every "grey" in the brand is a blue-tinted grey.
2. **Cyan is the single accent.** It marks what to look at first: eyebrows, numbers, card titles, the logo, thin rules.
3. **Two-tone headlines.** A statement is split in two, with the second half in cyan: "Meno complessità. **Più impresa.**" and "per **imprese e studi professionali**." This is the brand's signature device and the site should reuse it in the hero.
4. **Cards are one step lighter than the background** on dark (`#0C314D` on `#071F37`), with no visible border. On light, cards alternate between navy and ice.
5. **Teal and mint are decoration only**, at very small sizes. They never carry text or actions, with one exception for the tagline.
6. **Gold appears only in the network graphic**, alternating with cyan. It is the one warm color and should stay rare.
7. **Thin cyan rules** close a layout (footer line) or sit under a label (short bar).
8. **The logo arcs repeat as a watermark** in the corner of cards, at low opacity.

No red, green, orange or purple appears anywhere. Colors for errors and success states are not part of the brand and are proposed below.

## 4. Decisions for the site

**Dark theme follows the presentation exactly.** Cyan on navy has a contrast of 7.0 to 1, so cyan works as the primary color for buttons, links and labels.

**Light theme cannot use cyan the same way.** Cyan `#14B5EB` on white has a contrast of only 2.4 to 1, which fails accessibility for text and for button labels. The banner already solves this the right way: navy carries the text and the solid panels, and cyan is used large or decoratively. So in the light theme:

- `primary` is navy `#043D66` (buttons, solid panels), with off-white text at 10.7 to 1.
- Cyan stays for decoration, focus rings, the logo, and the large highlighted words in headlines (large bold text only).
- For small cyan-like text and links on white, the site uses a deeper azure, `#0B6FA4` (5.5 to 1). This color is **derived**, not found in the sources. It is the brand cyan hue at a lower lightness.

**One navy for light-theme text.** The deck navy `#071F37` is used for text on white (16.7 to 1). The slightly bluer royal navy from the signature is close enough that using both would only look inconsistent.

**Gold is kept as a chart and illustration color**, not as a UI color. For text on white it needs a darker version, `#7A6638`.

**Destructive red is proposed**, since the brand has none: `#C8102E` on light and `#FF6B6B` on dark.

## 5. Token mapping

Values are given in hex for review and in OKLCH for the stylesheet, since Tailwind v4 and current shadcn themes use OKLCH.

### Light

| Token | Hex | Brand source | Contrast |
| --- | --- | --- | --- |
| `background` | `#FFFFFF` | Banner and signature background | |
| `foreground` | `#071F37` | Navy 950 | 16.7 on background |
| `card` | `#FFFFFF` | | |
| `card-foreground` | `#071F37` | | |
| `popover` / `popover-foreground` | `#FFFFFF` / `#071F37` | | |
| `primary` | `#043D66` | Banner navy panel | |
| `primary-foreground` | `#F7FAFC` | Deck off-white | 10.7 on primary |
| `secondary` | `#E8F7FE` | Ice | |
| `secondary-foreground` | `#043D66` | | 10.3 on secondary |
| `muted` | `#F2F9FD` | Lighter ice, derived | |
| `muted-foreground` | `#48667F` | Blue-grey, derived from Mist | 5.7 on muted |
| `accent` | `#E8F7FE` | Ice (hover backgrounds) | |
| `accent-foreground` | `#043D66` | | |
| `border` / `input` | `#D6E6EF` | Derived from Mist | |
| `ring` | `#14B5EB` | Cyan | |
| `destructive` | `#C8102E` | Proposed | 5.9 on background |
| `brand` | `#14B5EB` | Cyan, for decoration and large highlights | |
| `brand-strong` | `#0B6FA4` | Derived azure, for links and small accent text | 5.5 on background |
| `chart-1` to `chart-5` | `#14B5EB`, `#043D66`, `#24C0CB`, `#B49E6F`, `#347091` | Cyan, navy, teal, gold, steel | |

### Dark

| Token | Hex | Brand source | Contrast |
| --- | --- | --- | --- |
| `background` | `#071F37` | Slide background | |
| `foreground` | `#F7FAFC` | Slide text | 15.9 on background |
| `card` | `#0C314D` | Slide cards | |
| `card-foreground` | `#F7FAFC` | | 12.8 on card |
| `popover` / `popover-foreground` | `#0C314D` / `#F7FAFC` | | |
| `primary` | `#14B5EB` | Cyan | 7.0 on background |
| `primary-foreground` | `#071F37` | As in the "G" node: navy letter on cyan | 7.0 on primary |
| `secondary` | `#123E5E` | One step above card, derived | |
| `secondary-foreground` | `#F7FAFC` | | |
| `muted` | `#0C314D` | Card navy | |
| `muted-foreground` | `#A9C1D0` | Mist | 8.9 on background, 7.2 on card |
| `accent` | `#123E5E` | Hover backgrounds, derived | |
| `accent-foreground` | `#F7FAFC` | | |
| `border` / `input` | `#1B4A6B` | Derived from Steel, darkened | |
| `ring` | `#14B5EB` | Cyan | |
| `destructive` | `#FF6B6B` | Proposed | 6.0 on background |
| `brand` | `#14B5EB` | Cyan | |
| `brand-strong` | `#14B5EB` | Same as brand in dark | |
| `chart-1` to `chart-5` | `#14B5EB`, `#9ADFDA`, `#24C0CB`, `#B49E6F`, `#347091` | Cyan, mint, teal, gold, steel | |

## 6. Stylesheet

Drop-in replacement for the color variables that the preset writes into the global stylesheet. Radius, fonts and the rest of the preset stay as generated.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);                    /* #FFFFFF */
  --foreground: oklch(0.235 0.055 251.2);        /* #071F37 */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.235 0.055 251.2);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.235 0.055 251.2);
  --primary: oklch(0.350 0.089 247.1);           /* #043D66 */
  --primary-foreground: oklch(0.983 0.004 236.5);/* #F7FAFC */
  --secondary: oklch(0.967 0.018 227.3);         /* #E8F7FE */
  --secondary-foreground: oklch(0.350 0.089 247.1);
  --muted: oklch(0.978 0.009 232.4);             /* #F2F9FD */
  --muted-foreground: oklch(0.497 0.053 244.3);  /* #48667F */
  --accent: oklch(0.967 0.018 227.3);
  --accent-foreground: oklch(0.350 0.089 247.1);
  --destructive: oklch(0.530 0.207 22.3);        /* #C8102E */
  --border: oklch(0.916 0.021 232.1);            /* #D6E6EF */
  --input: oklch(0.916 0.021 232.1);
  --ring: oklch(0.724 0.140 229.0);              /* #14B5EB */

  --brand: oklch(0.724 0.140 229.0);             /* #14B5EB */
  --brand-strong: oklch(0.517 0.116 240.6);      /* #0B6FA4 */
  --brand-teal: oklch(0.738 0.120 202.5);        /* #24C0CB */
  --brand-mint: oklch(0.856 0.069 190.2);        /* #9ADFDA */
  --brand-gold: oklch(0.707 0.068 85.6);         /* #B49E6F */

  --chart-1: oklch(0.724 0.140 229.0);
  --chart-2: oklch(0.350 0.089 247.1);
  --chart-3: oklch(0.738 0.120 202.5);
  --chart-4: oklch(0.707 0.068 85.6);
  --chart-5: oklch(0.520 0.081 235.4);           /* #347091 */
}

.dark {
  --background: oklch(0.235 0.055 251.2);        /* #071F37 */
  --foreground: oklch(0.983 0.004 236.5);        /* #F7FAFC */
  --card: oklch(0.303 0.065 245.5);              /* #0C314D */
  --card-foreground: oklch(0.983 0.004 236.5);
  --popover: oklch(0.303 0.065 245.5);
  --popover-foreground: oklch(0.983 0.004 236.5);
  --primary: oklch(0.724 0.140 229.0);           /* #14B5EB */
  --primary-foreground: oklch(0.235 0.055 251.2);
  --secondary: oklch(0.351 0.073 244.4);         /* #123E5E */
  --secondary-foreground: oklch(0.983 0.004 236.5);
  --muted: oklch(0.303 0.065 245.5);
  --muted-foreground: oklch(0.798 0.034 235.3);  /* #A9C1D0 */
  --accent: oklch(0.351 0.073 244.4);
  --accent-foreground: oklch(0.983 0.004 236.5);
  --destructive: oklch(0.712 0.181 22.8);        /* #FF6B6B */
  --border: oklch(0.394 0.075 242.8);            /* #1B4A6B */
  --input: oklch(0.394 0.075 242.8);
  --ring: oklch(0.724 0.140 229.0);

  --brand: oklch(0.724 0.140 229.0);
  --brand-strong: oklch(0.724 0.140 229.0);

  --chart-2: oklch(0.856 0.069 190.2);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-strong: var(--brand-strong);
  --color-brand-teal: var(--brand-teal);
  --color-brand-mint: var(--brand-mint);
  --color-brand-gold: var(--brand-gold);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
}
```

The `.dark` class is the shadcn convention. For the theme to follow the visitor's system setting automatically, a small inline script in the page head sets the class from `prefers-color-scheme` before first paint, and a toggle can override it. That belongs to the scaffolding work, not to this document.

The preset's own variable list (for example sidebar tokens) should be checked when the project is scaffolded, and any extra tokens mapped the same way: navy surfaces, cyan accent.

## 7. Usage rules for components

| Element | Light | Dark |
| --- | --- | --- |
| Page background | `background` | `background` |
| Headings and body | `foreground` | `foreground` |
| Highlighted half of a headline | `brand` (large bold text only) | `brand` |
| Eyebrow labels, step numbers | `brand-strong` | `brand` |
| Links in text | `brand-strong` | `brand` |
| Primary button | `primary` (navy) | `primary` (cyan, navy label) |
| Cards | White with `border`, or `secondary` (ice), or solid `primary` for a featured card | `card`, no border |
| Short rule under an eyebrow | `brand-teal` | `brand-teal` |
| Footer rule, dividers | `brand` at 1px | `brand` at 1px |
| Decorative dots | `brand-teal`, `brand-mint` | Same |
| Network graphic nodes | `brand` and `brand-gold`, lines in `chart-5` | Same |
| Logo arc watermark in cards | `brand` at 10 to 20 percent opacity | Same |
| Hero and final call to action | A navy panel (`primary`) is appropriate even in light theme, as in the banner | `background` |

Do not use `brand`, `brand-teal`, `brand-mint` or `brand-gold` for small text on white. None of them reaches a contrast of 4.5 to 1.

## 8. Typography note

The presentation uses Aptos and the banner uses a geometric sans similar to Montserrat. The site uses Noto Sans as decided. The brand's typographic habits are worth keeping: bold headings, uppercase eyebrows with wide letter spacing, and the widely spaced "G E N E S" wordmark (which should come from the logo file, not be typeset).

## 9. Open points

1. Is there an official brand manual with exact color values? The light-theme navy and cyan here are sampled from images.
2. A vector logo is needed, in a version for light backgrounds and one for dark backgrounds.
3. Approval is needed for the three colors that do not come from the brand: the deeper azure for links, and the two reds for errors.
4. Should the site open in light or dark by default when the visitor has no system preference? The presentation is dark, the banner and signature are light. The recommendation is to follow the system setting and fall back to light.
