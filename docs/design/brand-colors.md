# Genes Consulting: brand colors, components and icons mapped to defaults

Status: draft for review.

## The rule

Nothing in the code is custom. Every color is a Tailwind v4 default palette color, every component is a default shadcn/ui component, every icon comes from lucide, and every size, radius and spacing value comes from the Tailwind default scale.

- Write `bg-sky-950`, `text-sky-400`, `rounded-xl`, `p-6`.
- Never write arbitrary values such as `bg-[#071F37]`, `text-[17px]`, `w-[340px]` or `rounded-[14px]`.
- Never add hex or OKLCH values to the stylesheet. Theme tokens point to Tailwind color variables only.

The brand colors found in the client's documents are the reference used to choose the closest default. They do not go into the code.

## 1. How the match was made

The brand colors were read from the three files in `docs/requirements/initial`: exact hex values from the presentation XML, and sampled pixels from the banner and the email signature. Each one was compared with all 273 colors of the Tailwind v4 default palette (version 4.3.5) by distance in the OKLab color space, which follows how different two colors look. A distance under 0.02 is hard to see, 0.02 to 0.05 is a visible but small shift, and above 0.05 is a clear difference.

## 2. Color table

"Found in the documents" is the brand value. "Closest Tailwind" is the mathematically nearest default. "Used on the site" is the choice, which differs from the nearest only where noted.

| Role in the documents | Found in the documents | Closest Tailwind | Distance | Used on the site | Note |
| --- | --- | --- | --- | --- | --- |
| Dark background (slides) | `#071F37` | `slate-900` `#0F172B` | 0.033 | `sky-950` `#052F4A` | Decided by Zam: the bluer `sky-950` (0.059) instead of the nearest, to keep the brand's blue tint. Slightly lighter than the slides |
| Dark cards and panels (slides) | `#0C314D` | `sky-950` `#052F4A` | 0.010 | `sky-900` `#024A70` | The nearest is now the page background, so cards move one step lighter, as in the slides |
| Navy panel and dark cards (banner) | `#043D66` | `sky-900` `#024A70` | 0.042 | `sky-900` | |
| Navy text on white (banner, signature) | `#002C6C` | `blue-950` `#162456` | 0.045 | `sky-950` | Second nearest (0.063). Chosen so that all navy stays in one family |
| Cyan accent (slides) | `#14B5EB` | `sky-400` `#00BCFF` | 0.032 | `sky-400` | |
| Cyan accent (logo, banner) | `#00B8F8` | `sky-400` `#00BCFF` | 0.014 | `sky-400` | Almost exact |
| Darker end of the logo gradient | `#0098E8` | `sky-500` `#00A6F4` | 0.037 | `sky-500` | |
| Teal decoration (short rules, dots) | `#24C0CB` | `cyan-500` `#00B8DB` | 0.044 | `cyan-500` | |
| Mint decoration (small dot, tagline) | `#9ADFDA` | `teal-200` `#96F7E4` | 0.061 | `teal-200` | |
| Gold nodes in the network graphic | `#B49E6F` | `olive-400` `#ABAB9C` | 0.058 | `yellow-600` `#D08700` | The nearest defaults are greys and lose the gold. `yellow-600` (0.099) is the nearest that still reads as gold. Approved by Zam |
| Connector lines in the graphic | `#347091` | `cyan-700` `#007595` | 0.031 | `sky-800` `#00598A` | Used for borders on dark, kept in the sky family |
| Text on dark | `#F7FAFC` | `slate-50` `#F8FAFC` | 0.001 | `slate-50` | Exact |
| Secondary text on dark | `#A9C1D0` | `slate-300` `#CAD5E2` | 0.073 | `slate-300` | |
| "CONSULTING" in the wordmark | `#BED5E3` | `slate-300` `#CAD5E2` | 0.015 | `slate-300` | Only inside the logo image |
| Light background | `#FFFFFF` | `white` | 0 | `white` | Exact |
| Ice tint (light cards, waves) | `#E8F7FE` | `blue-50` `#EFF6FF` | 0.009 | `sky-50` `#F0F9FF` | Second nearest (0.012), same family as the rest |
| Subtitle on white (banner) | `#5080A8` | `slate-500` `#62748E` | 0.047 | `slate-600` `#45556C` | One step darker for readable contrast |

The whole site therefore uses four Tailwind color families: **sky** (brand navy and cyan), **slate** (text and neutrals), and small amounts of **cyan**, **teal** and **yellow** for decoration. Red is added for errors only.

## 3. The usage pattern

Reading the three files together, the brand follows one consistent logic, and the site keeps it:

1. **Navy is the base.** Full background on dark material, text and solid panels on light material.
2. **Cyan is the single accent.** Eyebrows, numbers, card titles, the logo, thin rules.
3. **Two-tone headlines.** The second half of a statement is in cyan: "Meno complessità. **Più impresa.**"
4. **Cards are one step lighter than the background** on dark. On light they alternate between navy and ice.
5. **Teal and mint are decoration only**, at small sizes.
6. **Gold appears only in the network graphic.**
7. No red, green, orange or purple appears anywhere in the brand.

## 4. Theme tokens

shadcn components read semantic tokens (`bg-primary`, `text-muted-foreground`). Each token points to a Tailwind default color. Components and pages use the semantic classes first, and a direct palette class such as `text-sky-400` only for brand decoration.

| Token | Light | Dark |
| --- | --- | --- |
| `background` | `white` | `sky-950` |
| `foreground` | `sky-950` | `slate-50` |
| `card` | `white` | `sky-900` |
| `card-foreground` | `sky-950` | `slate-50` |
| `popover` | `white` | `sky-900` |
| `popover-foreground` | `sky-950` | `slate-50` |
| `primary` | `sky-900` | `sky-400` |
| `primary-foreground` | `slate-50` | `sky-950` |
| `secondary` | `sky-50` | `sky-800` |
| `secondary-foreground` | `sky-900` | `slate-50` |
| `muted` | `sky-50` | `sky-900` |
| `muted-foreground` | `slate-600` | `slate-300` |
| `accent` | `sky-100` | `sky-800` |
| `accent-foreground` | `sky-900` | `slate-50` |
| `border` | `slate-200` | `sky-800` |
| `input` | `slate-200` | `sky-700` |
| `ring` | `sky-400` | `sky-400` |
| `destructive` | `red-600` | `red-400` |
| `chart-1` | `sky-400` | `sky-400` |
| `chart-2` | `sky-900` | `teal-200` |
| `chart-3` | `cyan-500` | `cyan-500` |
| `chart-4` | `yellow-600` | `yellow-600` |
| `chart-5` | `sky-700` | `sky-700` |

### Contrast check

Measured with the Tailwind values. 4.5 to 1 is the minimum for normal text.

| Pair | Ratio | Result |
| --- | --- | --- |
| `sky-950` text on `white` | 13.9 | Pass |
| `slate-50` label on `sky-900` button (light primary) | 9.1 | Pass |
| `slate-600` secondary text on `white` / on `sky-50` | 7.6 / 7.1 | Pass |
| `sky-700` link on `white` | 5.9 | Pass |
| `red-600` on `white` | 4.8 | Pass |
| `sky-400` on `white` | about 2.2 | Fail. Decoration and large headline words only |
| `slate-50` text on `sky-950` page / on `sky-900` card | 13.3 / 9.1 | Pass |
| `sky-400` on `sky-950` page | 6.4 | Pass |
| `sky-400` on `sky-900` card | 4.4 | Just under. Large or bold text only |
| `sky-300` on `sky-900` card | 5.7 | Pass. Use for small cyan text inside cards |
| `sky-950` label on `sky-400` button (dark primary) | 6.4 | Pass |
| `slate-300` secondary text on `sky-950` page / on `sky-900` card | 9.3 / 6.4 | Pass |
| `red-400` on `sky-950` page | 4.8 | Pass |
| `red-300` on `sky-900` card | 4.9 | Pass. Use for error text inside cards |

This is why the light theme uses navy (`sky-900`) for buttons and `sky-700` for links: cyan on white is not readable as text. The client's own banner does the same, with navy text and cyan only as a highlight.

### Stylesheet

Replaces the blue and emerald values that preset `b2DcSAJ7K` writes into the global stylesheet. Only references to Tailwind variables, no color values.

```css
:root {
  --background: var(--color-white);
  --foreground: var(--color-sky-950);
  --card: var(--color-white);
  --card-foreground: var(--color-sky-950);
  --popover: var(--color-white);
  --popover-foreground: var(--color-sky-950);
  --primary: var(--color-sky-900);
  --primary-foreground: var(--color-slate-50);
  --secondary: var(--color-sky-50);
  --secondary-foreground: var(--color-sky-900);
  --muted: var(--color-sky-50);
  --muted-foreground: var(--color-slate-600);
  --accent: var(--color-sky-100);
  --accent-foreground: var(--color-sky-900);
  --destructive: var(--color-red-600);
  --border: var(--color-slate-200);
  --input: var(--color-slate-200);
  --ring: var(--color-sky-400);
  --chart-1: var(--color-sky-400);
  --chart-2: var(--color-sky-900);
  --chart-3: var(--color-cyan-500);
  --chart-4: var(--color-yellow-600);
  --chart-5: var(--color-sky-700);
}

.dark {
  --background: var(--color-sky-950);
  --foreground: var(--color-slate-50);
  --card: var(--color-sky-900);
  --card-foreground: var(--color-slate-50);
  --popover: var(--color-sky-900);
  --popover-foreground: var(--color-slate-50);
  --primary: var(--color-sky-400);
  --primary-foreground: var(--color-sky-950);
  --secondary: var(--color-sky-800);
  --secondary-foreground: var(--color-slate-50);
  --muted: var(--color-sky-900);
  --muted-foreground: var(--color-slate-300);
  --accent: var(--color-sky-800);
  --accent-foreground: var(--color-slate-50);
  --destructive: var(--color-red-400);
  --border: var(--color-sky-800);
  --input: var(--color-sky-700);
  --chart-2: var(--color-teal-200);
}
```

The `@theme inline` block that the preset generates (mapping `--color-primary: var(--primary)` and so on) stays as generated. Any extra tokens the preset defines, such as sidebar tokens, get the same treatment: sky for navy and cyan, slate for neutrals. To verify when scaffolding: that Tailwind emits the referenced `--color-*` variables in the build. If one is missing, declaring the theme as `@theme static` makes all of them available.

Radius, spacing, font sizes and shadows are left exactly as the preset and Tailwind define them.

## 5. Component table

Each visual element found in the documents, and the default shadcn/ui component that replaces it. Components are added with the shadcn CLI and used with their stock variants.

| Found in the documents | Where | shadcn/ui component | Variant and classes |
| --- | --- | --- | --- |
| Rounded navy cards with title and one line of text | Slides 3 to 12 | `Card` with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Default. Title in `text-sky-300` on dark |
| Numbered step cards (01 to 04) | Slides 3, 6 | `Card` | Number as text: `text-2xl font-bold text-sky-400` |
| Full-width list rows | Slide 5 | `Item` inside `ItemGroup`, or `Card` with `size="sm"` | Default |
| Eyebrow label above titles ("AREA 01") | All slides | `Badge` | `variant="outline"` or plain text with `text-xs font-semibold uppercase tracking-widest` |
| Short rule under the eyebrow, footer rule, vertical divider in the signature | All | `Separator` | `bg-cyan-500` for the short one, default for the others |
| Light and navy service cards with icon | Banner | `Card` | Default, and one featured card with `bg-primary text-primary-foreground` |
| Call to action ("Parliamone") | Slide 13 | `Button` | `default` and `outline`, sizes `default` and `lg` |
| Text links | | `Button` | `variant="link"` |
| Top navigation with services dropdown | Site | `NavigationMenu` | Default |
| Mobile menu | Site | `Sheet` | `side="right"` |
| Theme switch `[ light | system | dark ]` in the footer | Site | `ToggleGroup` with three `ToggleGroupItem`s | `type="single" variant="outline" size="sm"`, icons `Sun`, `Monitor`, `Moon`. Default value: system |
| Breadcrumbs | Site | `Breadcrumb` | Default |
| FAQ | Site | `Accordion` | `type="single" collapsible` |
| Contact form | Site | `Field`, `Input`, `Textarea`, `Checkbox`, `Label`, `Button` | Default |
| Form feedback | Site | `Sonner` (toast), `Alert` | Default |
| Blog post cards | Site | `Card` | Default, with `AspectRatio` for the cover |
| Blog categories and tags | Site | `Badge` | `variant="secondary"` |
| Blog pagination | Site | `Pagination` | Default |
| Privacy and AI notices | Signature | `Alert` with `AlertTitle`, `AlertDescription` | Default |
| Loading placeholders | Site | `Skeleton` | Default |
| Two-column blocks ("Per le imprese" / "Per gli studi") | Slide 10 | Two `Card`s in `grid md:grid-cols-2 gap-6` | Default |
| Three dots at the top right of slides | Slides 2 to 12 | Not reproduced | Pure decoration with no default equivalent |
| Faded arcs in card corners and backgrounds | Banner | Not reproduced, or the logo image at `opacity-10` | No default equivalent |
| Hub-and-spoke "G" network graphic | Slides 1, 2, 7 | lucide `Waypoints` icon at large size in `text-sky-400` | Approved by Zam. A custom drawing would break the rule |

Exact component names (`Item`, `Field`) are to be confirmed against the shadcn version installed by the preset. If one is not available, `Card` and the plain form primitives cover the same need.

### Section presets (editor choices)

Editors style page sections ("Sezioni") only by picking a word from a list in EmDash. Each word maps to the classes below, in `astro-src/lib/section-style.ts` (tested in `tests/section-style.test.ts`). A new option is a code PR that adds a row here; editors never type a class or a colour.

| Field (EmDash) | Option | Classes / component |
| --- | --- | --- |
| Sfondo | Nessuno | page background |
| Sfondo | Tenue | `bg-muted dark:bg-sky-900/50` |
| Sfondo | Blu | `dark border-y border-border bg-background text-foreground`: the band switches to the dark theme tokens (sky-950, cards sky-900, primary sky-400), so contents keep their contrast. Default for Apertura |
| Spaziatura | Compatta / Normale / Ampia | `py-4 md:py-6` / `py-8 md:py-12` / `py-12 md:py-20`; with a background `py-8 md:py-10` / `py-12 md:py-16` / `py-16 md:py-24` |
| Larghezza | Normale / Stretta | none / `mx-auto max-w-3xl` |
| Allineamento | Sinistra / Centrato | none / `text-center`, buttons `justify-center` |
| Colonne (schede) | Automatiche / 2 / 3 / 4 | by card count / `@xl:grid-cols-2` / `+ @4xl:grid-cols-3` / `+ @5xl:grid-cols-4` |
| Stile schede | Schede / Semplice | `Card` / no card, `border-t pt-4` |
| Pulsanti: Stile | Principale / Secondario / Contorno / Link | `Button` `default` / `secondary` / `outline` / `link`, size `lg` |
| Accento (Apertura) | Oro | bar `h-1 w-12 rounded-full bg-yellow-600`, eyebrow `text-yellow-700 dark:text-yellow-600`. Never a gold background: white on yellow-600 fails contrast |
| Illustrazione (Apertura) | Rete / Immagine / Nessuna | lucide `Waypoints` `size-48 text-sky-400` / EmDash image `rounded-2xl` / none |

## 6. Icon table

All icons from lucide, which is the icon library the shadcn preset installs. Default stroke, sized with `size-4`, `size-5`, `size-6` or `size-8`.

| Found in the documents | Where | lucide icon |
| --- | --- | --- |
| Checklist document with a tick | Banner, "Servizi amministrativi e societari" | `ClipboardCheck` |
| Group of three people | Banner, "Consulenza aziendale integrata" | `Users` |
| Monitor | Banner, "Servizi digitali" | `Monitor` |
| Phone handset | Signature | `Phone` |
| Globe | Signature, website | `Globe` |
| LinkedIn mark | Signature | `Linkedin` if the installed lucide version still ships it (brand icons are deprecated there), otherwise a text link |
| Leaf | Signature, privacy notice | `Leaf` |
| "AI" in a rounded square | Signature, AI notice | `Bot` |
| Four-point star bullet (✦) | Slide 4 | `Sparkle` |
| Network of nodes | Slides 1, 2, 7 | `Waypoints` |
| Address (no icon in the source) | Contatti | `MapPin` |
| Theme switch (not in the source) | Footer | `Sun`, `Monitor`, `Moon` |
| Company logo, placeholder | Header, footer | `Rss`, next to the name set as text |
| Email (no icon in the source) | Contatti | `Mail` |

Proposed icons for the six areas of assistance, which have no icon in the source:

| Area | lucide icon |
| --- | --- |
| Consulenza aziendale | `BriefcaseBusiness` |
| Servizi societari | `Building2` |
| Documentazione | `FileText` |
| Rapporti con enti | `Landmark` |
| Servizi digitali | `Fingerprint` |
| Servizi integrati | `Handshake` |

**Logo placeholder.** Until a vector logo exists, the header and footer show the lucide `Rss` icon in `text-sky-400` (its quarter-circle arcs are the closest default to the Genes mark) next to "GENES CONSULTING" set as text. The final logo will be the one exception to "icons from lucide": a brand asset used as an image file. It has to be built, because the repository only has it inside raster images.

## 7. Type, size and shape

The presentation uses Aptos and the banner a geometric sans. The site uses Noto Sans from the preset. Sizes come from the Tailwind scale only.

| Found in the documents | Tailwind classes |
| --- | --- |
| Cover headline, 39pt bold | `text-4xl md:text-6xl font-bold tracking-tight` |
| Slide titles, 29 to 31pt bold | `text-3xl md:text-4xl font-bold tracking-tight` |
| Lead paragraph, 22pt | `text-lg md:text-xl` |
| Card titles, 17pt bold | `text-lg font-semibold` |
| Body in cards, 13pt | `text-sm` or `text-base` |
| Eyebrow, 11 to 12pt bold uppercase, spaced | `text-xs font-semibold uppercase tracking-widest` |
| Footer and captions, 8pt | `text-xs text-muted-foreground` |
| Rounded card corners | The `Card` default radius from the preset |
| Hairline rules | `Separator` default, `h-px` |
| Page width and gutters | `container mx-auto px-4 md:px-6`, sections `py-16 md:py-24` |
| Grids of 2, 3 and 4 cards | `grid gap-6 md:grid-cols-2`, `lg:grid-cols-3`, `lg:grid-cols-4` |

## 8. Usage summary

| Element | Light | Dark |
| --- | --- | --- |
| Page | `bg-background text-foreground` | Same |
| Highlighted half of a headline | `text-sky-500` (large bold text only) | `text-sky-400` |
| Eyebrow, step numbers | `text-sky-700` | `text-sky-400` on the page, `text-sky-300` inside cards |
| Links | `text-sky-700` | `text-sky-400` |
| Primary button | `Button` default (navy) | `Button` default (cyan with navy label) |
| Cards | `Card` default, or `bg-secondary` | `Card` default |
| Short rule under an eyebrow | `bg-cyan-500` | `bg-cyan-500` |
| Hero and final call to action | `bg-primary text-primary-foreground`, as in the banner | `bg-background` |

Do not use `sky-400`, `sky-500`, `cyan-500`, `teal-200` or `yellow-600` for small text on white.

## 9. Theme behaviour

- The site follows the visitor's system setting (`prefers-color-scheme`) by default.
- The footer has a three-way switch, `[ light | system | dark ]`, built with the shadcn `ToggleGroup`.
- The choice is stored in the browser. "System" removes the stored choice and follows the device again.
- A small inline script in the page head applies the `dark` class before first paint, so the page does not flash the wrong theme.

## 10. Decided

- Gold is `yellow-600`.
- The network graphic is the lucide `Waypoints` icon.
- The dark background is `sky-950`, with cards on `sky-900`.
- The theme follows the system, with a light, system and dark switch in the footer.
- The logo is the lucide `Rss` icon as a placeholder until a vector logo is built.

## 11. Open points

1. **Logo.** A vector logo for light and dark backgrounds still has to be built. The cleanest source is the transparent logo image embedded in the presentation, which can be traced to SVG with Inkscape.
