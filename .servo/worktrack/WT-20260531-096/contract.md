# Worktrack Contract: WT-20260531-096

## Metadata

- worktrack_id: WT-20260531-096
- title: MS-9 最终 CodeReview Worktrack
- milestone_id: MS-9
- node_type: review
- status: active
- created_at: 2026-05-31
- created_by: harness-kernel

## Task Goal

Perform one final CodeReview pass over MS-9 after WT-094 fixes and WT-095 acceptance-threshold decision, before handing MS-9 back for fdch0 final milestone acceptance.

## Scope

In scope:

- Review current MS-9 code and docs changes on top of `develop`.
- Focus on retrieval evaluation anti-cheat, search extension isolation, PostgreSQL test defaults, CI workflow, Prisma provider/migration boundary, and accidental runtime scope drift.
- Run targeted validation that does not require production secrets.
- Fix narrow review blockers if they are directly in scope.

Out of scope:

- Marking MS-9 accepted.
- Activating MS-10.
- Implementing retrieval runtime.
- Production data migration or remote service decisions.

## Baseline And Branch Policy

- baseline_branch: develop
- baseline_ref: 8b92a1c8864d861e7d3ff51571e5bd1935accd58
- branch: worktrack/wt-20260531-096-ms9-final-code-review
- baseline_form: commit-on-review-branch
- merge_required: true
- if_interrupted_strategy: keep branch and preserve gate evidence

## Acceptance Criteria

- Findings are documented by severity.
- Sidecar review findings are incorporated or explicitly adjudicated.
- `git diff --check`, script syntax checks, retrieval gate checks, `npm run lint`, `npm run test`, and `npm run build` pass or failures are explicitly justified.
- Final verdict is pass only if no critical/high blocker remains.
