# MS5 Rigorous CodeReview

This document records the rigorous CodeReview evidence for `WT-20260526-037` under `MS-20260526-001 / GitHub CI 与上云前决策基线`.

Final milestone acceptance remains a programmer decision. This review does not accept or complete the milestone.

## Review Baseline

- Local `develop` baseline reviewed: `7805fe20c412597d3fd11cc7837846ca0747da36`.
- GitHub `origin/develop` observed at: `40f4c11d119d70c839347de870813a5474c195f5`.
- Remote CI evidence remains useful for the older pushed commit, but it is not fresh evidence for local `7805fe20c412597d3fd11cc7837846ca0747da36`.
- Review worktree: `.worktrees/wt-20260526-037-rigorous-code-review`.

## Findings

### Blocker: Core ticket APIs allow cross-ticket access for any authenticated user

Authenticated users can read or mutate ticket-specific resources by guessing or obtaining a ticket id, even when they are not the creator, assignee, member, or admin.

Affected surfaces:

- `src/app/api/tickets/route.ts:22` skips all non-admin scope guards when `scope=all`, so `src/app/api/tickets/route.ts:50` can return every ticket to a regular authenticated user.
- `src/app/api/tickets/[id]/route.ts:12` authenticates `GET /api/tickets/[id]`, but `src/app/api/tickets/[id]/route.ts:16` fetches the ticket only by id and returns it at `src/app/api/tickets/[id]/route.ts:39`.
- `src/app/api/tickets/[id]/route.ts:54` authenticates `PATCH /api/tickets/[id]`, but `src/app/api/tickets/[id]/route.ts:59` fetches the ticket only by id and permits status, assignee, and priority mutation through `src/app/api/tickets/[id]/route.ts:115`.

Impact:

- Non-admin users can bypass ticket list scoping with `scope=all`.
- Non-participants can view private ticket titles, descriptions, comments, logs, members, and attachments.
- Non-participants can update ticket status, priority, and assignee through the detail PATCH route.

### Blocker: Ticket child-resource APIs lack participant/admin access control

Authenticated users can access or mutate child resources for any ticket id.

Affected surfaces:

- `src/app/api/tickets/[id]/comments/route.ts:11` authenticates comments GET, but `src/app/api/tickets/[id]/comments/route.ts:15` returns all comments for the id without participant authorization.
- `src/app/api/tickets/[id]/comments/route.ts:38` authenticates comment creation, but `src/app/api/tickets/[id]/comments/route.ts:48` creates a comment on any existing ticket id and triggers participant notifications.
- `src/app/api/tickets/[id]/attachments/route.ts:46` authenticates attachment listing, but `src/app/api/tickets/[id]/attachments/route.ts:50` only checks ticket existence and `src/app/api/tickets/[id]/attachments/route.ts:55` returns attachments.
- `src/app/api/tickets/[id]/attachments/route.ts:78` authenticates upload, but `src/app/api/tickets/[id]/attachments/route.ts:82` only checks ticket existence and `src/app/api/tickets/[id]/attachments/route.ts:128` creates an attachment on that ticket.
- `src/app/api/tickets/[id]/logs/route.ts:10` authenticates logs GET, but `src/app/api/tickets/[id]/logs/route.ts:14` returns all logs for the id.
- `src/app/api/tickets/[id]/members/route.ts:33` authenticates member listing, but `src/app/api/tickets/[id]/members/route.ts:37` returns all members for the id.

Impact:

- Non-participants can add comments and upload attachments to tickets they should not access.
- Non-participants can enumerate ticket participants, logs, and attachments.

Counter-evidence reviewed:

- `GET /api/tickets` is scoped for non-admin users by assignee, creator, or membership when scope is not `all`.
- `GET /api/tickets/stats` is scoped by creator, assignee, or membership for most counters.
- Notification routes correctly scope updates to the notification owner.
- Member mutation routes have a `canModifyMembers` guard, but member listing does not.

Required follow-up:

- Add a dedicated authorization hardening worktrack before MS5 final acceptance.
- Introduce a shared ticket-access helper for participant/admin checks.
- Apply it consistently to ticket detail, comments, attachments, logs, and member listing/mutation surfaces.
- Add route tests for non-participant `403` behavior across affected surfaces.

### High: Upload type validation can be bypassed by spoofed MIME with a dangerous extension

`src/app/api/tickets/[id]/attachments/route.ts:25` accepts a file if the client-provided MIME type is in the allowlist, without requiring the filename extension to match. `src/app/api/tickets/[id]/attachments/route.ts:112` then preserves the original extension and `src/app/api/tickets/[id]/attachments/route.ts:127` exposes it under `/uploads/`.

Impact:

- A file named `x.html` can be accepted if the client reports `image/png`.
- The file is saved under a public URL and may be served directly from `public/uploads`.

Counter-evidence reviewed:

- The route has a 10 MB size limit.
- Attachment delete is scoped to uploader or admin.
- Current tests cover a normal PDF upload and attachment deletion ownership, but not MIME/extension mismatch or dangerous extensions.

Required follow-up:

- Require extension and MIME compatibility, or use a conservative extension allowlist independent of client MIME.
- Reject dangerous public extensions such as `.html`, `.svg`, `.js`, and executable/script-like formats even when MIME is spoofed.
- Add tests for mismatched MIME/extension, empty MIME fallback, dangerous extensions, and size limit.

### Medium: Prisma migration deploy/drift is not verified by CI

The CI build database uses `npx prisma db push --skip-generate` in `.github/workflows/ci.yml:53`, and the API test helper also uses `prisma db push` in `src/test/api-test-helpers.ts:37`.

Impact:

- The current schema state is validated.
- Ordered migration application from an empty database, migration drift, and migration deploy failures are not caught by the quality gate.

Required follow-up:

- Add a future CI/governance worktrack to validate migration application if this project starts relying on migrations as a deploy artifact.

### Medium: Remote CI evidence is stale for the latest local baseline

`git ls-remote origin develop` returned `40f4c11d119d70c839347de870813a5474c195f5`, while the local review baseline is `7805fe20c412597d3fd11cc7837846ca0747da36`.

Impact:

- GitHub Actions run `26464643535` proves the older pushed commit, not the latest local Harness closeout commit.
- Local validation for this review passed, but final MS5 handback should not claim remote CI freshness until the latest `develop` is pushed and observed.

Required follow-up:

- After review/fix worktracks are merged, push `develop` to GitHub and observe a fresh Actions run for the final local commit.

### Medium: Build emits a worktree root inference warning

`npm run build` passed, but Next.js/Turbopack warned that it inferred the workspace root as the main checkout because multiple lockfiles exist:

- `E:\repos\personal\reqflow\package-lock.json`
- `E:\repos\personal\reqflow\.worktrees\wt-20260526-037-rigorous-code-review\package-lock.json`

Impact:

- The warning does not fail the build.
- It can make worktree-local builds noisier and may become confusing when multiple worktrees are active.

Required follow-up:

- Consider setting `turbopack.root` in `next.config.ts` in a separate low-risk config worktrack if the warning persists or affects developer confidence.

## Test Coverage Gaps

- Current route tests cover happy paths and selected permission checks, such as notification ownership, member-management permissions, and attachment deletion ownership.
- They do not cover non-participant access denial for ticket list `scope=all`, ticket detail, comments, attachment listing/upload, logs, or member listing.
- They do not cover non-participant denial for ticket detail PATCH.
- They do not cover upload MIME/extension mismatch, dangerous public extensions, empty MIME fallback, or size-limit rejection.

## Validation Evidence

| Command | Result |
|---------|--------|
| `git diff --check` | Pass; line-ending warnings only for touched Harness artifacts |
| `npm ci` | Pass in WT-037 worktree |
| `npm run lint` | Pass |
| `npm run test` | Pass: 10 files, 71 tests |
| `npm run build` | Pass with worktree root inference warning |
| `git ls-remote origin develop` | `40f4c11d119d70c839347de870813a5474c195f5` |

An earlier `npm run test` attempt failed because the WT-037 worktree did not yet have its own `node_modules/prisma/build/index.js`. After `npm ci`, the same test command passed.

## Policy Review

- No PostgreSQL migration was introduced.
- No pgvector or vector database was introduced.
- No AI implementation or OpenAI SDK installation was introduced.
- No production secrets were created or disclosed.
- No paid provider selection was made.
- No Gitee requirement was added.
- Existing untracked local governance directories were not deleted or bulk-added.
- Programmer final milestone acceptance remains pending.

## Verdict

WT-037 successfully performed the requested rigorous CodeReview.

MS5 is not ready for final programmer acceptance until the blocking ticket authorization findings and upload validation finding are resolved, and a fresh final CI observation is recorded for the resulting `develop` commit.
