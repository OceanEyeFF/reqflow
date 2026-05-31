# Worktrack Contract: WT-20260531-094

## Metadata

- worktrack_id: WT-20260531-094
- title: MS-9 代码验收与集成风险审查
- milestone_id: MS-9
- node_type: review
- status: active
- created_at: 2026-05-31
- created_by: harness-kernel

## Task Goal

Perform a final code acceptance review for MS-9 before fdch0 milestone final acceptance. The review must look for acceptance blockers across code, scripts, CI, Prisma/PostgreSQL migration, pgvector/FTS readiness, retrieval evaluation gate, and documentation consistency.

## Scope

In scope:

- Review MS-9 changes since baseline `629f7c7232e425d08484877593222cbeaec2ec1f`.
- Inspect Prisma provider and PostgreSQL migration boundary.
- Inspect Docker Compose and GitHub Actions PostgreSQL/pgvector readiness.
- Inspect `scripts/postgres-readiness.mjs`, `scripts/search-extension-readiness.mjs`, and `scripts/retrieval-evaluation-gate.mjs`.
- Inspect package scripts and MS-9 documentation.
- Run targeted validation commands that do not require production secrets.
- Record findings with severity and file references.

Out of scope:

- Implementing MS-10 retrieval runtime.
- Changing application behavior unless a critical acceptance blocker requires a follow-up worktrack.
- Production data migration execution.
- External hosted search, third-party vector database, or provider billing decisions.
- Marking MS-9 accepted.

## Baseline And Branch Policy

- baseline_branch: develop
- baseline_ref: 443ba05f51dcfe647729606195c04e951d084699
- branch: worktrack/wt-20260531-094-ms9-code-acceptance-review
- baseline_form: commit-on-review-branch
- merge_required: true
- if_interrupted_strategy: keep branch and preserve gate evidence

## Acceptance Criteria

- Review findings are documented in `.servo/worktrack/WT-20260531-094/gate-evidence.md`.
- High or critical blockers, if found, are either fixed in scope or explicitly converted into follow-up worktracks before MS-9 final acceptance.
- Targeted validation includes at minimum:
  - `git diff --check`
  - syntax checks for MS-9 scripts
  - `npm run retrieval:evaluate`
  - `npm run lint`
- PostgreSQL/DB validation is run if the local service is available; otherwise the evidence must clearly state the reason and rely on prior WT-080/WT-081 validation records.
- MS-9 remains active and final acceptance remains fdch0-only.

## Evidence Requirements

- Code review findings by severity.
- Validation command results.
- Boundary compliance result.
- Residual risks and explicit final gate verdict for WT-094.
