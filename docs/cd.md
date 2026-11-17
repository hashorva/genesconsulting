# Continuous deployment

Built on [hashorva/cd-kit](https://github.com/hashorva/cd-kit) (pinned `@v0`). GitHub-hosted runners only, because this repo is public.

## Flow

| Event | What runs |
| --- | --- |
| Pull request | CI. If `CD_DEPLOY_ENABLED=true` and the PR is from this repo: a **preview** deploy to a separate preview Worker with its own D1/R2/KV (own data) and preview flags **on**. |
| Merge to `main` | CI, then **automatic production deploy**. No manual approval. New features ship hidden (flag off in production). |
| Release (tag `vX.Y.Z`) | Marks the release; pushing an older tag re-deploys it (**rollback**). |

### Ship hidden, then release
1. A feature PR adds code behind a flag in `flags.json` (`production: false`, `preview: true`). Reviewers see it on the PR preview.
2. Merge: it goes live in production but visitors cannot see it. Test it there with the flag override (below).
3. **Release** = a small PR that sets `production: true` for that flag; merging deploys it and a `vX.Y.Z` tag is cut on that commit. Everyone sees it.
4. Later, delete the flag from code and `flags.json`.

Semver: patch = fixes, minor = newly released features, major = breaking.

Previews have their own D1/R2/KV (`env.preview` in `wrangler.jsonc`), so PR code never runs migrations against, or edits, production content. Preview data is throwaway test content; real content is edited only on production's admin.

## EmDash content safety (hard rules)

- A deploy uploads **code only**. Content lives in EmDash's own storage (D1/R2 bindings on Cloudflare) and is edited and published only inside EmDash.
- Never delete/recreate/rename D1, R2, KV bindings in wrangler config, and never use destructive migrations, seeding that overwrites content, or `--delete`-style syncs in CI.
- Schema changes to EmDash collections are additive and called out in the PR; reset/seed scripts must never run against production.
- Content releases (EmDash) and code releases (tags) are independent: a code release must work with whatever content exists, and flagged-off features must not require new content.

## EmDash database migrations

EmDash's own core migrations (additive schema, never content) run from CI right after every deploy: jobs `migrate-preview` and `migrate-production` call `scripts/emdash-migrate.sh <d1-name>`, which runs `emdash migrate` against the remote D1 with the environment's Cloudflare token. Deployed Workers run EmDash with `migrations.runtime: "check"` (`astro.config.mjs`), so they never migrate inside a request: that used to leave the lock held when a request was cut off, with every page on 503 "Database migrations are required". Between a deploy and its migrate job (seconds) a deploy that brings new migrations answers 503. The script takes over a lock only when it is older than 2 minutes, and refuses to touch a database that has migrations this build does not know.

Manual recovery (from a machine with the token): `CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... scripts/emdash-migrate.sh genesconsulting` (or `genesconsulting-preview`), or re-run the failed `cd` workflow.

## Feature flags

`flags.json` holds per-environment defaults (`production`, `preview`); git history is the audit trail. Resolution order at runtime: Worker var `FLAG_<NAME>=true|false` (override) > `flags.json` default for the current environment (`ENVIRONMENT` var, `preview` or `production`).

How to toggle:
- **Release for everyone:** PR changing `production` to `true` in `flags.json`, merge (auto-deploys).
- **Instant kill switch / staged test:** set the `FLAG_<NAME>` var in the Cloudflare dashboard (Workers → genesconsulting → Settings → Variables) with no redeploy. `wrangler.jsonc` must set `keep_vars: true` so deploys never wipe dashboard overrides. Fold the final value back into `flags.json` afterwards.
- Flags only gate code. They never create, change or delete EmDash content; a flagged-off feature must not require content that does not exist yet.

## AI review and auto-merge

`ai-review.yml` (adapted from finduck) reviews non-draft PRs except docs-only ones (only `docs/` or `README.md`) with the Claude Code Action. **Sonnet** for ordinary PRs; **Opus** when the PR is labelled `risky`, changes more than 400 lines, or touches workflows, `AGENTS.md`/`CLAUDE.md`, the rule docs `docs/cd.md` and `docs/design/brand-colors.md`, agent skills (`.agents/`, `.claude/`, `.mcp.json`), wrangler or Astro config, package/lock files, `flags.json`, `seed/`, migrations, `astro-src/flags.ts`, `astro-src/worker.ts`, or auth/session/middleware files or folders (edit `RISKY_PATHS` in the workflow). It skips without the `CLAUDE_CODE_OAUTH_TOKEN` secret and on forks. The review only comments; `review-gate` (below) makes its verdict a merge requirement.

**Auto-merge.** Those Opus-scope PRs are *critical*: `review-gate` fails on them until the owner **approves the current head commit** (an approving review whose commit is the head SHA, and no later change request or dismissal). Agents work as a separate bot account (`docs/github-bot-setup.md`), so they cannot approve; the ruleset dismisses approvals on every new push. On a non-critical PR agents enable auto-merge (squash) right away. Job `review-gate` is a **required check**: it passes only when the review comment for the current head ends with `Reviewed: <head sha>` and starts with "No blocking findings." (docs-only PRs pass directly; with no `CLAUDE_CODE_OAUTH_TOKEN`, e.g. fork PRs, it fails closed unless the repo variable `AI_REVIEW_OPTIONAL=true` is set as a deliberate, same-repo-only opt-out). So nothing merges, by hand or automatically, before a clean review of the exact commit, and a new push needs a new review. The merge deploys to production as usual (auto-merge runs as the user who enabled it, so the push to `main` triggers `cd`). Owner setup: *Allow auto-merge* in the repository settings, and `review-gate` required on `main` next to `gate`.

**Why a PR cannot weaken its own gate.** `review-gate` runs from the PR's own copy of `ai-review.yml`, so on its own a PR could edit it. That is closed by GitHub, not by a workflow: `.github/CODEOWNERS` lists the critical paths (including `.github/` itself) with the owner as code owner, and the ruleset on `main` has *Require review from Code Owners*. GitHub always reads CODEOWNERS from `main`, so any PR touching those paths needs the owner's approval, whatever the PR changes. Agents cannot give it because they act as the bot account, and an author never approves their own PR. Remaining limits are listed in `docs/github-bot-setup.md`.

## i18n

Italian only for now (no language switcher), but built i18next-style: no hardcoded UI strings, locale-keyed resources, Italian as default locale at `/`. Languages can be added later without restructuring. Page content stays in EmDash.

## One-time setup (owner)

Step by step, with exact token permissions: [`docs/cloudflare-setup.md`](cloudflare-setup.md). In short: API token + account ID as secrets on the `production` and `preview` environments (no required reviewers), `main` protected by the ruleset in `docs/github-bot-setup.md` (checks `gate` and `review-gate`, code-owner review, *Allow auto-merge* on), the agents' bot account set up as described there, repository variable `CD_DEPLOY_ENABLED=true`, then finish the EmDash admin setup right after the first deploy and set `EMDASH_ENCRYPTION_KEY` as a Worker secret. AI review needs the repository secret `CLAUDE_CODE_OAUTH_TOKEN`.

`wrangler.jsonc` already has `env.preview` with its own D1/R2/KV, `ENVIRONMENT` set per environment, and `keep_vars: true`.
