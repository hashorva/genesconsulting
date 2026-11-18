# Cloudflare setup (owner, one time)

Everything that needs a Cloudflare login or a secret. The code side needs nothing else. Takes about 20 minutes.

What exists after this: one Worker on your Cloudflare account. There is no preview or staging site: unfinished components are checked on the live site, where only signed-in EmDash editors and admins see them (`docs/cd.md`).

| Worker | URL | Deployed by | Data |
| --- | --- | --- | --- |
| `genesconsulting` | `https://genesconsulting.<your-subdomain>.workers.dev` | every merge to `main` (and `vX.Y.Z` tags, for rollback) | D1 `genesconsulting`, R2 `genesconsulting-media`, KV for sessions |

The first deploy creates its database, bucket and KV namespace automatically. You never create them by hand, and you never rename or delete them (that is where the content lives).

## 1. Check your workers.dev subdomain

1. Open https://dash.cloudflare.com, pick your account, then **Workers & Pages**.
2. If it asks you to choose a `workers.dev` subdomain, pick one (for example your name). If it shows one already, note it. CI cannot pick it for you.

## 2. Copy your account ID

On the same **Workers & Pages** page, the **Account ID** is in the right-hand column (or in the URL: `dash.cloudflare.com/<account-id>/...`). Copy it.

## 3. Create the API token

1. Go to **My Profile → API Tokens** (https://dash.cloudflare.com/profile/api-tokens) → **Create Token**.
2. Use the template **Edit Cloudflare Workers** → **Use template**.
3. Under **Permissions**, check that these are there, and add the missing ones with **+ Add more**:
   - Account · **Workers Scripts** · Edit
   - Account · **Workers KV Storage** · Edit
   - Account · **Workers R2 Storage** · Edit
   - Account · **D1** · Edit  ← not in the template, add it
   - Account · **Account Settings** · Read
4. **Account Resources**: Include → your account only. **Zone Resources**: All zones from your account (needed later for the custom domain), or a specific zone once the domain is on Cloudflare.
5. Leave IP filtering empty (GitHub runners have changing IPs). Set a TTL if you want it to expire.
6. **Continue to summary → Create Token**. Copy the token now; Cloudflare shows it once.

## 4. Add the secrets to GitHub

In https://github.com/hashorva/genesconsulting/settings/environments:

1. Create (or open) the environment **`production`**:
   - **Add environment secret** `CLOUDFLARE_API_TOKEN` = the token from step 3.
   - **Add environment secret** `CLOUDFLARE_ACCOUNT_ID` = the ID from step 2.
   - No required reviewers: production deploys automatically after CI passes on `main` (unfinished features stay hidden behind flags, see `docs/cd.md`).

Then in **Settings → Secrets and variables → Actions → Variables**, add the repository variable **`CD_DEPLOY_ENABLED`** = `true`. Until it exists, CI runs but nothing deploys. Set it when you are ready for the first deploy (step 6), because from then on every merge to `main` goes live.

**Required:** repository secret `CLAUDE_CODE_OAUTH_TOKEN` (**Settings → Secrets and variables → Actions → Secrets**; create it with `claude setup-token`). The AI review uses it, and the required check `review-gate` fails on every PR that changes more than docs when it is missing (see `docs/cd.md`).

## 5. Protect `main`

**Settings → Rules → Rulesets → New branch ruleset** (or edit the existing one): enforcement **Active**, target **Include default branch**, then turn on **Restrict deletions**, **Block force pushes**, **Require a pull request before merging** (required approvals **0**, allowed merge method **Squash**) and **Require status checks to pass** with **`gate`** and **`review-gate`** (source: GitHub Actions). Leave the bypass list empty.

Then **Settings → General → Pull Requests**: tick **Allow auto-merge** and **Automatically delete head branches**. Non-critical PRs merge themselves after a clean AI review; critical ones wait for you to press **Squash and merge** (see `docs/cd.md`).

## 6. First production deploy

1. With `CD_DEPLOY_ENABLED=true` set, merge the scaffold PR (or re-run the latest `cd` workflow on `main` from **Actions** if it is already merged).
2. **Actions** → the `cd` run on `main` → the `deploy` job. When it finishes, its summary shows the Worker URL.
3. Optionally mark it as a release: **Releases → Draft a new release → tag `v0.1.0`** on `main` → **Publish**. Pushing an older tag later re-deploys that version (rollback).

## 7. Finish the EmDash setup immediately

Until the setup wizard is completed, **whoever opens the admin first becomes the administrator**. So, right after the deploy:

1. Open `https://genesconsulting.<your-subdomain>.workers.dev/_emdash/admin`.
2. Complete the wizard: site title, your admin account and passkey. Do **not** import sample content.

The site starts hidden from search engines (staging) until you choose to go live in EmDash.

## 8. Set the encryption key

EmDash encrypts plugin secrets (for example SMTP passwords) with `EMDASH_ENCRYPTION_KEY`. It is a Worker secret, not a GitHub one, and it is only needed before you save a plugin secret, but set it now so you don't forget.

1. Generate one locally: `bunx emdash secrets generate` (or `npx emdash secrets generate`). It prints `emdash_enc_v1_...`.
2. **Save it in your password manager first.** If it is lost, every plugin secret encrypted with it is lost. It is not in the D1 backups.
3. Cloudflare dashboard → **Workers & Pages → genesconsulting → Settings → Variables and Secrets → Add** → Type **Secret**, name `EMDASH_ENCRYPTION_KEY`, value the key → **Deploy**.
(CLI alternative: `bunx wrangler secret put EMDASH_ENCRYPTION_KEY`.)

## Later: the client's domain

Passkeys only work on the hostname where they were created. The admin passkey you make on `workers.dev` stops working when the site moves to the real domain, so when the domain is ready:

1. The domain must be an active zone on the **same** Cloudflare account.
2. A PR adds to `wrangler.jsonc`: `"routes": [{ "pattern": "www.genesconsulting.it", "custom_domain": true }]` and `"EMDASH_SITE_URL": "https://www.genesconsulting.it"` under `vars`. Merging it deploys.
3. In EmDash, **Settings → General → Change domain**, then register a new passkey on the new domain (keep an admin able to sign in by another method during the switch).

Never put `siteUrl` in `astro.config.mjs`: the public URL comes from `EMDASH_SITE_URL`.

## Removing the old preview site (once)

Until 2026-11-17 pull requests also deployed to a separate preview Worker. It is gone from the code; delete its leftovers by hand. **Check each name before deleting: everything without `-preview` is production and holds the real content.**

1. Cloudflare → **Workers & Pages** → `genesconsulting-preview` → **Settings** → **Delete**.
2. Cloudflare → **Storage & Databases → D1** → `genesconsulting-preview` → **Settings** → **Delete**.
3. Cloudflare → **R2** → `genesconsulting-media-preview` → empty it if it has files, then **Settings** → **Delete bucket**.
4. Cloudflare → **Storage & Databases → KV**: the namespace whose name contains `genesconsulting-preview` (created for its `SESSION` binding) → **Delete**. Keep the one bound to `genesconsulting`: open it and check **Bindings** if unsure.
5. GitHub → **Settings → Environments** → `preview` → **Delete environment** (removes its two secrets).
