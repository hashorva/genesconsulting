# Continuous deployment

Built on [hashorva/cd-kit](https://github.com/hashorva/cd-kit) (pinned `@v0`). GitHub-hosted runners only, because this repo is public.

## Flow

| Event | What runs |
| --- | --- |
| Pull request | CI and the AI review. No preview site: EmDash owns the content and the database, and code PRs only change the components that render it. |
| Merge to `main` | CI, then **automatic production deploy**. No manual approval. Unfinished components ship hidden behind a flag. |
| Release (tag `vX.Y.Z`) | Marks the release; pushing an older tag re-deploys it (**rollback**). |

### Ship hidden, then release
1. A feature PR adds the component behind a flag in `flags.json` (`public: false`).
2. Merge: it goes live in production, but only signed-in EmDash **editors and admins** see it. Visitors don't. Sign in at `/_emdash/admin`, then open the public page in the same browser to check it on real content.
3. **Release** = a small PR that sets `public: true` for that flag; merging deploys it and a `vX.Y.Z` tag is cut on that commit. Everyone sees it.
4. Later, delete the flag from code and `flags.json`.

Semver: patch = fixes, minor = newly released features, major = breaking.

## EmDash content safety (hard rules)

- A deploy uploads **code only**. Content lives in EmDash's own storage (D1/R2 bindings on Cloudflare) and is edited and published only inside EmDash.
- Never delete/recreate/rename D1, R2, KV bindings in wrangler config, and never use destructive migrations, seeding that overwrites content, or `--delete`-style syncs in CI.
- Schema changes to EmDash collections are additive and called out in the PR; reset/seed scripts must never run against production.
- Only exception: `scripts/content-load.ts` (starter copy in `content/`), run by hand with the owner's go-ahead, never from CI. It goes through the EmDash API as a signed-in admin, creates only pages whose slug does not exist, as drafts, and never updates or deletes an entry. `--publish` runs only after the owner reviewed the drafts in the admin; it publishes only never-published drafts still titled as in `content/`, replaces only the seed's placeholder tagline, and fills menus only when they are empty.
- Content releases (EmDash) and code releases (tags) are independent: a code release must work with whatever content exists, and flagged-off features must not require new content.

## EmDash database migrations

EmDash's own core migrations (additive schema, never content) run from CI right after every deploy: job `migrate-production` calls `scripts/emdash-migrate.sh genesconsulting`, which runs `emdash migrate` against the remote D1 with the environment's Cloudflare token. Deployed Workers run EmDash with `migrations.runtime: "check"` (`astro.config.mjs`), so they never migrate inside a request: that used to leave the lock held when a request was cut off, with every page on 503 "Database migrations are required". Between a deploy and its migrate job (seconds) a deploy that brings new migrations answers 503. The script takes over a lock only when it is older than 2 minutes, and refuses to touch a database that has migrations this build does not know.

Manual recovery (from a machine with the token): `CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... scripts/emdash-migrate.sh genesconsulting`, or re-run the failed `cd` workflow.

## Feature flags

`flags.json` says per flag whether it is `public`; git history is the audit trail. Resolution at runtime (`astro-src/flags.ts`):
1. Worker var `FLAG_<NAME>=true|false`: on or off for everyone (`false` is the kill switch, also for editors).
2. `public: true`: on for everyone.
3. Otherwise on only for a signed-in EmDash user with role **Editor or Admin** (`Astro.locals.user`, set by EmDash from the admin session cookie). EmDash marks responses for signed-in users as uncacheable, so a hidden component never reaches visitors through a cache.

In a component or page:

```astro
---
import { env } from "cloudflare:workers";
import { isEnabled } from "../flags";
const showNewHero = isEnabled("new_hero", env, Astro.locals.user);
---
{showNewHero ? <NewHero /> : <Hero />}
```

How to toggle:
- **Release for everyone:** PR changing `public` to `true` in `flags.json`, merge (auto-deploys).
- **Instant kill switch / forced on:** set the `FLAG_<NAME>` var in the Cloudflare dashboard (Workers → genesconsulting → Settings → Variables) with no redeploy. `wrangler.jsonc` must set `keep_vars: true` so deploys never wipe dashboard overrides. Fold the final value back into `flags.json` afterwards.
- Flags only gate code. They never create, change or delete EmDash content; a flagged-off feature must not require content that does not exist yet.

## AI review and auto-merge

`ai-review.yml` (adapted from finduck) reviews non-draft PRs except docs-only ones (only `docs/` or `README.md`) with the Claude Code Action. **Sonnet** for ordinary PRs; **Opus** when the PR is labelled `risky`, changes more than 400 lines, or touches workflows, `AGENTS.md`/`CLAUDE.md`, the rule docs `docs/cd.md` and `docs/design/brand-colors.md`, agent skills (`.agents/`, `.claude/`, `.mcp.json`), wrangler or Astro config, package/lock files, `flags.json`, `seed/`, migrations, `astro-src/flags.ts`, `astro-src/worker.ts`, or auth/session/middleware files or folders (edit `RISKY_PATHS` in the workflow). It skips without the `CLAUDE_CODE_OAUTH_TOKEN` secret and on forks. The review only comments; `review-gate` (below) makes its verdict a merge requirement.

**Auto-merge.** Those Opus-scope PRs are *critical*: they need the same clean review, and the owner merges them by hand once `gate` and `review-gate` are green. `review-gate` fails on them while auto-merge is enabled, which catches auto-merge turned on before the checks finish; it cannot stop a direct merge (or auto-merge on an already-green PR) by anyone with write access, so that part rests on the AGENTS.md rule. On a non-critical PR agents enable auto-merge (squash) right away. Job `review-gate` is a **required check**: it passes only when the review comment for the current head ends with `Reviewed: <head sha>` and starts with "No blocking findings." (docs-only PRs pass directly; with no `CLAUDE_CODE_OAUTH_TOKEN`, e.g. fork PRs, it fails closed unless the repo variable `AI_REVIEW_OPTIONAL=true` is set as a deliberate opt-out for same-repo, non-critical PRs). So nothing merges, by hand or automatically, before a clean review of the exact commit, and a new push needs a new review. The merge deploys to production as usual (auto-merge runs as the user who enabled it, so the push to `main` triggers `cd`). Owner setup: *Allow auto-merge* in the repository settings, and `review-gate` required on `main` next to `gate`.

**Known limit.** `review-gate` runs from the PR's own copy of `ai-review.yml`, so a PR that edits it could weaken its own gate. Such a PR touches `.github/`, so it is critical: Opus reviews it (the prompt treats any weakening of checks, permissions or the review as blocking) and it never auto-merges, so it waits for the owner's merge click. Agents and the owner share one GitHub account, so GitHub cannot enforce more than that: the owner accepted this instead of a separate bot account.

## i18n

Italian only for now (no language switcher), but built i18next-style: no hardcoded UI strings, locale-keyed resources, Italian as default locale at `/`. Languages can be added later without restructuring. Page content stays in EmDash.

## One-time setup (owner)

Step by step, with exact token permissions: [`docs/cloudflare-setup.md`](cloudflare-setup.md). In short: API token + account ID as secrets on the `production` environment (no required reviewers), `main` protected by a ruleset (pull request required, checks `gate` and `review-gate`, squash only; *Allow auto-merge* on), repository variable `CD_DEPLOY_ENABLED=true`, then finish the EmDash admin setup right after the first deploy and set `EMDASH_ENCRYPTION_KEY` as a Worker secret. AI review needs the repository secret `CLAUDE_CODE_OAUTH_TOKEN`.

`wrangler.jsonc` defines the one production Worker with its D1/R2/KV and `keep_vars: true`.
