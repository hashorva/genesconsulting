# Agent rules — Genes Consulting

Public showcase site: Astro + EmDash (content/copy/blog) + Tailwind v4 + shadcn/ui, on a Cloudflare Worker. Content source: `docs/requirements/initial`. CD details: `docs/cd.md`.

## Project layout
- Bun + Astro (`output: "server"`) + EmDash on one Cloudflare Worker. Source in `astro-src/` (Astro `srcDir`), worker entry `astro-src/worker.ts`, config `astro.config.mjs` and `wrangler.jsonc` at the root.
- EmDash schema: `seed/seed.json` (changes are additive only). After a schema change, regenerate `emdash-env.d.ts` with `bunx emdash types` and commit it. The seed only applies when a site is first set up: additions reach the live site with `scripts/schema-sync.ts`, run by hand (creates missing block types and optional fields, appends optional fields to existing block types and new types to a blocks field's allowed list, never changes or deletes anything).
- Page sections: the pages' `layout` ("Sezioni") field holds EmDash blocks (`hero`, `card_grid`, `steps`, `faq`, `media_text`, `stats`, `cta`, `text`), each rendered by one component in `astro-src/components/blocks/` built on shadcn `Card`/`Accordion`/`Button` (`PageBlocks.astro` maps them). A new repeated section = a block type in the seed + one component + one line in `PageBlocks.astro`. Editor style choices (Sfondo, Spaziatura, Colonne, button Stile...) are `select` fields whose words map to default classes only in `astro-src/lib/section-style.ts` (table in `docs/design/brand-colors.md`); never a free colour or class field.
- EmDash agent skills live in `.agents/skills/` (querying content, schema, plugins); the EmDash docs MCP is in `.mcp.json`.
- UI strings: `astro-src/i18n/locales/<locale>/<namespace>.json`, used via `useTranslations(Astro.currentLocale)`. Links by route key: `routePath("page.about")` from `astro-src/i18n/routes.ts`.
- shadcn/ui components go in `astro-src/components/ui/` via `bunx shadcn@latest add <name>` (style `base-rhea`, icons lucide). Use them in `.astro` files through `buttonVariants()` etc., or as React islands (`client:idle`) only when they need interaction.
- **Bun only.** Install with `bun install`, run tools with `bunx`, scripts with `bun run`. Never npm, npx, yarn or pnpm, and never tell the owner to run them: `package.json` pins `packageManager` to Bun, a `preinstall` guard makes `npm install` fail, and other lockfiles are gitignored. Only `bun.lock` is committed.
- Commands: `bun run dev`, `bun run build`, `bun run typecheck`, `bun run test`. Local secrets in `.dev.vars` (copy `.dev.vars.example`).

## HARD RULE: no custom design values
Everything visual uses defaults only. Humans and agents alike.
- **Colors and sizes:** only Tailwind v4 default palette and scale, e.g. `bg-sky-100`, `text-lime-700`, `p-4`, `rounded-lg`. **Never** arbitrary values such as `bg-[#12ab34]`, `text-[13px]`, `w-[317px]`, or custom hex/rgb/oklch in CSS. Do not add custom colors to the theme.
- **Components:** only default shadcn/ui components, unmodified in look (no restyled one-offs). Pick the closest default component to what the brand documents show.
- **Icons:** only the default icon set that shadcn/ui uses (lucide). No custom SVGs or other icon packs.
- The brand documents in `docs/requirements/initial` are a *reference*, not a spec to copy pixel-for-pixel: choose the **closest** Tailwind color / shadcn component. The mapping (brand color or element -> Tailwind class / shadcn component) lives in `docs/design/brand-colors.md`; use it, and add a row there instead of inventing a value. If nothing fits, ask the owner.
- Dark/light and mobile come from Tailwind variants (`dark:`, responsive prefixes) and the shadcn theme tokens, automatically.

## Trunk-based workflow
- `main` is the trunk: always releasable, protected, changed only by PR.
- Short-lived branches (hours to a day or two) cut from the latest `main`, small PRs, merged to `main` often. No long-lived feature or release branches.
- Unfinished work merges to `main` **dark behind a flag** (`flags.json`, `public: false`) instead of living on a branch.
- Merging to `main` runs CI, then **auto-deploys to production** (no manual gate). There is no preview or staging site: EmDash owns the content and the database, and code PRs only change components. Unfinished components are checked on the live site, where only signed-in EmDash editors and admins see them.
- A **release** turns a feature on for everyone: a small PR flipping its flag to `public: true`, then a `vX.Y.Z` tag. Rollback = deploy an earlier tag, or set the `FLAG_<NAME>` Worker var to `false` as a kill switch. See `docs/cd.md`.
- Code releases never overwrite or break EmDash content or its own releases.

## Git and PR flow
- Never push to `main`. One branch per agent/task (`claude/<topic>`), one PR per task, small and focused. Open it **ready for review** (not draft) once its checks pass locally.
- **Critical** PRs are the ones the AI review sends to Opus: the `risky` label, more than 400 changed lines, or touching workflows (`.github/`), `AGENTS.md`/`CLAUDE.md`, the rule docs `docs/cd.md` and `docs/design/brand-colors.md`, agent skills (`.agents/`, `.claude/`, `.mcp.json`), wrangler or Astro config, package/lock files, `flags.json`, `seed/`, migrations, the flags and Worker entry (`astro-src/flags.ts`, `astro-src/worker.ts`), or auth/session/middleware files or folders (`RISKY_PATHS` in `.github/workflows/ai-review.yml`). They get the Opus review and need the same green `review-gate`, but agents **never enable auto-merge on them and never merge them** (`review-gate` fails while auto-merge is on, but nothing technical stops a direct merge: this rule is the safeguard): the owner merges by hand once the checks are green. Agents never approve PRs. When unsure whether a PR is critical, treat it as critical.
- **Non-critical** PRs: the agent enables **auto-merge (squash)** as soon as the PR is open; GitHub merges it once both required checks pass: `gate` (CI) and `review-gate` (the AI review of the current head SHA said "No blocking findings."). Fix any findings with a new push, which is reviewed again. Docs-only PRs (only `docs/` or `README.md`) get no AI review and pass `review-gate` directly.
- Otherwise agents never merge or tag releases unless the owner asks.
- Never rewrite history on shared branches; never skip tests or disable checks to get green.

## Code vs content
- Code goes through PRs. Content/copy lives in EmDash; do not hardcode page copy in components, and never touch production content from CI or scripts. One exception: the starter-content loader `scripts/content-load.ts`, run by hand with the owner's go-ahead. It only creates missing pages as drafts, and its `--layout` and `--hero` modes only add a draft revision (sections, or an Apertura on top) to pages it published that nobody edited since; the live page never changes until a `--publish` step that runs only after the owner approved those drafts (see `docs/cd.md`).
- New components/behaviour ship behind a flag in `flags.json` (off in production). See `docs/cd.md` for the EmDash safety rules.
- UI: shadcn/ui components, Tailwind v4, Noto fonts, preset `b2DcSAJ7K` with the Genes Consulting brand colors (from the PDFs/docs), mobile-first, automatic light/dark.
- Runners: GitHub-hosted only (public repo). Never add self-hosted/Mac mini runners.
- Secrets never in the repo; ask the owner to add them in GitHub settings.

## Choose the model by task size
- **Haiku**: tiny edits (a button color, copy typo, class tweak, rename).
- **Sonnet**: normal work (a component, a page, a workflow change, tests).
- **Opus / Fable**: heavy work (architecture, EmDash schema design, SEO/AI-SEO content map, copy improvement, tricky debugging).
- AI review runs on every non-draft, non-docs-only PR (Sonnet by default, Opus for critical PRs); address its findings before auto-merge or asking for merge.
- UI strings go through an i18n layer (i18next style), Italian default and only language for now; no hardcoded strings in components.
- Parallel agents only on independent files/areas, each with its own branch and PR.
