# Worktree And Branch Audit

## Snapshot

- observed_on: 2026-05-26
- worktrack: `WT-20260524-020`
- baseline_branch: `develop`
- baseline_ref_before_cleanup: `3db0e3abaedb513c33c7ca105b87668be98ce222`

## Cleanup Policy

Only registered Git worktrees were eligible for automatic cleanup, and only when both conditions were true:

1. `git status --short --branch` showed a clean worktree.
2. The worktree HEAD was an ancestor of current `develop`.

No raw recursive filesystem deletion was used for unregistered directories.

## Registered Worktree Audit

| Worktree | Branch | Clean | HEAD Included In `develop` | Action |
|---|---|---:|---:|---|
| `.worktrees/wt-20260523-007-comments-members` | `worktrack/wt-20260523-007-comments-members` | yes | yes | removed with `git worktree remove`; branch deleted with `git branch -d` |
| `.worktrees/wt-20260523-008-att-notif` | `worktrack/wt-20260523-008-att-notif` | yes | yes | removed with `git worktree remove`; branch deleted with `git branch -d` |
| `.worktrees/wt-20260523-009-frontend` | `worktrack/wt-20260523-009-frontend` | yes | yes | removed with `git worktree remove`; branch deleted with `git branch -d` |
| `.worktrees/wt-20260523-010-tests` | `worktrack/wt-20260523-010-tests` | yes | yes | removed with `git worktree remove`; branch deleted with `git branch -d` |
| `.worktrees/develop-aw` | `develop-aw` | no | no | retained and deferred |
| `.worktrees/wt-20260524-020-worktree-branch-cleanup` | `worktrack/wt-20260524-020-worktree-branch-cleanup` | active | current branch | retained until closeout |

## Post-Cleanup Registered Worktrees

After safe cleanup, `git worktree list` showed only:

- main checkout: `develop`
- `.worktrees/develop-aw`: retained divergent/dirty worktree
- `.worktrees/wt-20260524-020-worktree-branch-cleanup`: active worktrack

## Deferred Items

| Item | Reason | Next Handling |
|---|---|---|
| `.worktrees/develop-aw` | divergent from `develop` and has `prisma/dev.db` modified, `prisma/dev.db-journal` deleted, and `dev-server.log` untracked | requires programmer or later targeted decision; do not delete automatically |
| `.worktrees/wt-20260523-002-handoff` | unregistered directory visible on disk after registered cleanup | inspect before deletion; no raw delete in WT-020 |
| `.worktrees/wt-20260523-003-lint-ts` | unregistered directory visible on disk after registered cleanup | inspect before deletion; no raw delete in WT-020 |
| `.worktrees/wt-20260523-004-build` | unregistered directory visible on disk after registered cleanup | inspect before deletion; no raw delete in WT-020 |
| `.worktrees/wt-20260523-005-auth` | unregistered directory visible on disk after registered cleanup | inspect before deletion; no raw delete in WT-020 |
| `.worktrees/wt-20260523-006-tickets` | unregistered directory visible on disk after registered cleanup | inspect before deletion; no raw delete in WT-020 |

## Notes

- The first cleanup command timed out after partially completing safe cleanup. Follow-up status checks showed WT-007, WT-008, and WT-009 registered worktrees had been removed, WT-009 branch still existed, and WT-010 remained registered.
- Follow-up commands completed WT-009 branch deletion and WT-010 worktree/branch cleanup.
- Because unregistered directories are not represented in `git worktree list`, they are treated as filesystem residue requiring separate explicit approval or a narrower cleanup slice.
