# Worktrack Contract: WT-20260527-046

## Metadata

- worktrack_id: WT-20260527-046
- title: MS6 CodeReview 专用评审
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: review
- status: completed
- created_at: 2026-05-27
- updated: 2026-05-27

## Intake Summary

- original_request: MS6 还应该补充一个 CodeReview 专用 worktrack。
- append_classification: scope supplement before final milestone acceptance
- approval_required: false; programmer explicitly requested adding this MS6 worktrack.

## Scope

### Goal

Perform a dedicated code review of the MS6 AI discussion implementation before final milestone acceptance.

### In Scope

- Review `POST /api/ai/draft`, provider adapter, redaction, knowledge snippets, discussion UI, draft handoff, and new-ticket prefill.
- Check auth, secret handling, manual confirmation, error handling, hydration, storage, test coverage, and MS6/MS7 boundary.
- Produce review findings with severity, file/line references, and required fixes if any.

### Out of Scope

- Implementing new AI provider admin configuration.
- Admin knowledge-base upload/import.
- PostgreSQL/pgvector/vector search.
- Final programmer acceptance decision.

## Acceptance Criteria

- Findings are reported in code-review format with severity and file/line references.
- No Critical/High findings remain unaddressed or untracked.
- Any required fixes are either completed in this worktrack or turned into explicit follow-up worktrack(s).
- `npm run lint`, `npm run test`, and `npm run build` are run or an equivalent validation rationale is recorded.

## Notes

- This worktrack invalidates the previous MS6 final handback until completed.
- completed_evidence: `docs/ms6-code-review.md` and `.servo/worktrack/WT-20260527-046/gate-evidence.md`
