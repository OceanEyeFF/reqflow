---
title: "Gate Evidence"
artifact_type: "worktrack-gate-evidence"
generated_from: "servo-set-harness-goal-skill/assets/worktrack/gate-evidence.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Gate Evidence

> 这是 `.servo/worktrack/gate-evidence.md` 的运行样例，用来记录当前 worktrack 的 gate 证据与裁决依据。
> 按 `Control Signal` / `Supporting Detail` 双层输出：`Control Signal` 只放影响下一动作决策的关键结论；`Supporting Detail` 放完整证据。

## Metadata

- worktrack_id: N/A
- updated: 2026-05-22
- gate_round: N/A
- required_evidence_lanes: N/A
- review_profile: N/A

## Review Lane

> review_profile 驱动 review lane 选择：`light` / `standard` / `risky` / `deep`。review lanes 支持并行 `SubAgent` 执行；`deep` 使用四路 review 覆盖；运行时无法委派所选 lanes 时记录 fallback。lane ids 为 `static-semantic-review`（静态语义解释）、`test-review`（测试 review）、`project-security-review`（security review）、`complexity-performance-review`（代码复杂度和性能 review）。

### Control Signal
- review_subagent_lanes: N/A
- review_profile: N/A
- four_lane_dispatch_status: N/A
- confidence: N/A
- ready_for_gate: false
- residual_risks: N/A

### Supporting Detail
- input_ref: N/A
- freshness: N/A
- static_semantic_review: N/A
- test_review: N/A
- project_security_review: N/A
- complexity_performance_review: N/A
- four_lane_fallback_reason: N/A
- missing_evidence: No active worktrack exists.
- upstream_constraint_signals: `.servo/control-state.md#Current Next Action`
- low_severity_absorption_applied: N/A

## Validation Lane

### Control Signal
- confidence: N/A
- ready_for_gate: false
- residual_risks: N/A

### Supporting Detail
- input_ref: N/A
- freshness: N/A
- missing_evidence: No active worktrack exists.
- upstream_constraint_signals: `.servo/control-state.md#Current Next Action`
- low_severity_absorption_applied: N/A

## Policy Lane

### Control Signal
- confidence: N/A
- ready_for_gate: false
- residual_risks: N/A

### Supporting Detail
- input_ref: N/A
- freshness: N/A
- missing_evidence: No active worktrack exists.
- upstream_constraint_signals: `.servo/control-state.md#Current Next Action`
- low_severity_absorption_applied: N/A

## Evidence Assessment

### Control Signal
- node_type: N/A
- applied_gate_criteria: N/A
- fallback_used: false
- overall_confidence: N/A
- overall_confidence_reason: No worktrack has reached Verify/Judge.
- freshness_blockers: N/A

### Supporting Detail
- node_type_source: N/A
- 完整证据维度摘要（首次生成时填充，后续更新只追加变更）

## Per-Surface Verdicts

### Control Signal
- implementation_surface: N/A
- validation_surface: N/A
- policy_surface: N/A
- low_severity_absorption_reason: N/A

### Supporting Detail
- 各面判定依据与引用：N/A

## Recommended Next Route

### Control Signal
- allowed_next_routes: RepoScope.Observe
- recommended_next_route: RepoScope.Observe
- approval_required: false
- needs_programmer_approval: false
- why: Harness has been initialized and no worktrack evidence exists yet.

### Supporting Detail
- approval_scope: N/A
- approval_reason: N/A

## Follow-up Actions

- Run RepoScope.Observe before opening any worktrack.
