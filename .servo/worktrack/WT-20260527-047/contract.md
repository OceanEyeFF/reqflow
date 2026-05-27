# Worktrack Contract: WT-20260527-047

## Metadata

- worktrack_id: WT-20260527-047
- title: MS6 专家评议评估
- milestone_id: MS-20260526-002
- derived_from_milestone: true
- node_type: review
- status: planned
- created_at: 2026-05-27
- updated: 2026-05-27

## Intake Summary

- original_request: MS6 还应该补充一个专家评议评估 worktrack。
- append_classification: scope supplement before final milestone acceptance
- approval_required: false; programmer explicitly requested adding this MS6 worktrack.

## Scope

### Goal

Evaluate MS6 from an expert product/architecture/security perspective before final milestone acceptance.

### In Scope

- Product fit: whether discussion flow satisfies non-professional requirement drafting.
- Architecture fit: provider-neutral contract, server-side Deepseek boundary, knowledge citation strategy, and MS7 split.
- Security/privacy fit: secret boundary, prompt data minimization, redaction, local storage staging, and no direct ticket mutation.
- Operability fit: missing key behavior, environment configuration, no live secret in CI, and local/demo constraints.
- Produce accept/defer/fix recommendations with rationale.

### Out of Scope

- Code-level exhaustive review already covered by WT-20260527-046.
- Implementing MS7 provider config or knowledge upload.
- Final programmer acceptance decision.

## Acceptance Criteria

- Evaluation covers product, architecture, security/privacy, and operability dimensions.
- Recommendations distinguish blockers from residual risks.
- If blockers exist, they are turned into explicit follow-up worktracks or fixes.
- If no blockers exist, MS6 can return to final programmer acceptance handback.

## Notes

- This worktrack runs after the dedicated CodeReview worktrack.
