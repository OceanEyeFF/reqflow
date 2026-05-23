---
title: "Worktrack Contract"
artifact_type: "worktrack-contract"
worktrack_id: "WT-20260523-017-ms003-final-code-review"
milestone_id: "MS-20260522-003"
derived_from_milestone: "review-added"
updated: "2026-05-23"
owner: "servo-kernel"
---

# Worktrack Contract

## Metadata

- worktrack_id: WT-20260523-017-ms003-final-code-review
- branch: worktrack/WT-20260523-017-ms003-final-code-review
- baseline_branch: develop-aw
- baseline_ref: ffd66b9
- owner: servo-kernel
- updated: 2026-05-23
- contract_status: ready_for_close

## Node Type

- type: review
- source_from_user_request: programmer requested an explicit CodeReview Worktrack for MS-003.
- baseline_form: commit-on-worktrack-branch
- merge_required: yes
- gate_criteria: review + test + policy
- if_interrupted_strategy: checkpoint-or-recover

## Task Goal

- Perform and record a formal MS-003 CodeReview worktrack, fixing any blocking defects found during review.

## Scope

- In scope: review MS-003 collaboration changes, permission boundaries, accepted smoke coverage, docs freshness, Gate evidence, and directly blocking review fixes.
- Out of scope: new product features, broad role model redesign, production storage/messaging decisions, schema changes, and unrelated cleanup.

## Acceptance Criteria

- CodeReview findings are recorded in worktrack evidence.
- Any blocking review finding is either fixed in this worktrack or explicitly converted to a follow-up blocker.
- Validation commands pass after review fixes.
- MS-003 milestone and repo status can reference this worktrack as final review evidence.

## Verification Requirements

- `npm run lint`
- `npm run build`
- `$env:DATABASE_URL='file:./dev.db'; npm run db:validate`
- clean temp DB migration + seed + `npm run smoke`
- screenshot review for the member/comment permission-disabled state
- stale-text reverse search for old notification method and README smoke wording
