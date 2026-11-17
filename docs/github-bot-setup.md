# Bot account for agents and the `main` ruleset

Agents (Claude Code threads) work on GitHub as a separate **machine account**, not as the owner. That is what makes the merge rules enforceable: GitHub never lets a PR's author approve it, and the bot is not a code owner, so only the owner can approve critical PRs.

## Why a machine account, not a GitHub App

| | Machine account (chosen) | GitHub App |
| --- | --- | --- |
| Claude Code threads can act as it | **Yes**: claude.ai connects to one GitHub *user* account, and the threads push and open PRs as that user. | **No**: claude.ai cannot log in as an App. The threads would keep acting as the owner. |
| Allowed on a free plan | Yes: GitHub's terms allow one free machine account per person, run by a human who is responsible for it. | Yes. |
| Useful later for | — | Workflows that must post as a trusted identity (see "Remaining limits"). |

Repository rulesets on a personal account offer *Require review from Code Owners*, *Dismiss stale approvals*, *Require approval of the most recent reviewable push* and a required status check pinned to an app. *Require workflows to pass* is organization-level only, and push rulesets (restricting file paths) are Enterprise-only, so they are not used here.

## How it fits together

1. `.github/CODEOWNERS` lists every critical path (the same list as `RISKY_PATHS` in `.github/workflows/ai-review.yml`, including `.github/` itself) with `@hashorva` as owner.
2. The ruleset on `main` requires code-owner review. GitHub reads CODEOWNERS from `main`, so a PR cannot loosen it, nor edit the workflows, without the owner's approval.
3. `review-gate` (required) also needs the owner's approval of the head commit for critical PRs that are critical for other reasons (the `risky` label, more than 400 lines).
4. Non-critical PRs need no human: the bot enables auto-merge and GitHub merges once `gate` and `review-gate` pass.

## Owner steps (once)

Do them in this order. Steps 1 to 3 can happen before the PR is merged; step 5 must come after it is merged (it needs `.github/CODEOWNERS` on `main`).

### 1. Create the machine account
1. Open a private browser window and sign up at github.com with a username such as `genes-agent`. Use an email you control (a `+bot` plus address of your own email works).
2. Turn on two-factor authentication (Settings → Password and authentication) and store the recovery codes with your own.
3. Optional, but it makes the ownership clear: set the profile bio to "Machine account operated by @hashorva".

### 2. Give it write access to this repo (and only that)
1. As **hashorva**: repo **Settings → Collaborators → Add people** → the bot's username. On a personal account every collaborator gets write access: it can push branches, open PRs and enable auto-merge, but it cannot change settings, rulesets or secrets.
2. As **the bot** (private window): accept the invitation (from its email, or github.com/hashorva/genesconsulting/invitations).
3. Do the same for finduck and cd-kit if you want agents to keep working there (step 3 changes the identity for every Claude session of yours).

### 3. Connect Claude to the bot instead of hashorva
1. In the private window where the bot is signed in to GitHub, sign in to claude.ai as yourself.
2. Open https://claude.ai/connect-github and authorize the bot's GitHub account. If it asks where to install the Claude GitHub App, it is already installed on your hashorva repos; the bot uses it there through its collaborator access, so no new installation is needed.
3. Check: the next PR an agent opens shows the bot as its author. Agents are told (AGENTS.md) to say so if they find they still push as hashorva.

### 4. Merge the PR
Merge the PR that adds this file (it also adds auto-merge and removes the preview site). It is critical, so you merge it by hand with the admin bypass.

### 5. Ruleset on `main`
**Settings → Rules → Rulesets** → edit your existing `main` ruleset (or **New ruleset → New branch ruleset**):
- **Enforcement status:** Active.
- **Bypass list:** add **Repository admin**, mode **For pull requests only**. That is you only (the bot is not an admin), so you can still merge your own PRs, which you cannot approve yourself.
- **Target branches:** Include default branch.
- **Restrict deletions** and **Block force pushes**: on.
- **Require a pull request before merging:** on, with
  - Required approvals: **0** (non-critical PRs merge without you),
  - **Dismiss stale pull request approvals when new commits are pushed**: on,
  - **Require review from Code Owners**: on,
  - **Require approval of the most recent reviewable push**: on,
  - Allowed merge methods: **Squash** only.
- **Require status checks to pass:** add **`gate`** and **`review-gate`**; for each, set the source to **GitHub Actions** (so nobody can satisfy them with a hand-made commit status). Leave "Require branches to be up to date" off.

If GitHub refuses code-owner review with 0 approvals, do not raise approvals to 1 (non-critical PRs would never merge); tell an agent and we will move the approval check fully into `review-gate`.

### 6. Repo settings
**Settings → General → Pull Requests:** tick **Allow auto-merge** and **Automatically delete head branches**. If you created the old `owner-ok` label, delete it (Issues → Labels); it is no longer used.

### 7. Keep secrets out of PR workflows
**Settings → Environments → production → Deployment branches and tags:** **Selected branches and tags**, add `main` and the tag rule `v*`. A PR's workflows (which run the PR's own copy, before any review) then cannot read the Cloudflare token.

### 8. Test it
Ask an agent for a tiny non-critical PR (a README line): it should merge by itself after the AI review. Then one touching `.github/`: it should wait for your approval.

## Remaining limits (honest list)

- **Side-branch workflows.** The bot has write access, so it could push a workflow to a branch with no PR (a `push` trigger runs the branch's copy) that posts a fake passing `gate` or `review-gate` check on another PR's commit. Pinning the check source to GitHub Actions does not stop this, because that run is GitHub Actions too. A personal-account repo has no setting that limits which branches may contain workflow files. It needs a deliberately misbehaving agent, and it is visible in the Actions tab. A stronger fix, if ever needed, is a GitHub App that posts the gate from a `pull_request_target` workflow with its key in an environment limited to `main`, plus the CI result checked by that same trusted job.
- **Secrets visible to PR workflows.** `CLAUDE_CODE_OAUTH_TOKEN` is a repository secret used by the PR review, so a PR's own workflow could read it before review. Treat it as low-value (it can only run reviews) and rotate it if a suspicious workflow ever appears. Cloudflare secrets are protected by step 7.
- **One claude.ai connection.** If claude.ai is reconnected to hashorva, agents act as the owner again and the rules stop binding them.
- **Commit author.** Commits keep the git author the session sets; what GitHub enforces is the account that pushes and opens the PR, which is the bot.
