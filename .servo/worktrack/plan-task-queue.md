---
title: "Plan / Task Queue"
artifact_type: "worktrack-plan-task-queue"
generated_from: "servo-set-harness-goal-skill/assets/worktrack/plan-task-queue.md"
updated: "2026-05-22"
owner: "servo-kernel"
---

# Plan / Task Queue

> 这是 `.servo/worktrack/plan-task-queue.md` 的运行样例，用来把 worktrack contract 展开成当前执行队列。
> 按 `Control Signal` / `Supporting Detail` 双层输出：`Control Signal` 只放影响下一动作决策的关键结论；`Supporting Detail` 放完整计划上下文。

## Metadata

- worktrack_id: N/A
- updated: 2026-05-22
- current_phase: N/A
- contract_ref: worktrack/contract.md
- queue_status: not_initialized

## Task List

1. [ ] N/A

## Execution Order Notes

- N/A

## Dependencies

- N/A

## Current Blockers

- No active worktrack exists.

## Current Next Action

### Control Signal
- selected_next_action: RepoScope.Observe
- selection_reason: Harness initialization has completed; repo state must be observed before any worktrack queue can be scheduled.

### Supporting Detail
- selected_next_action_id: repo-observe-after-set-goal
- selected_next_action: RepoScope.Observe via repo-status-skill
- selection_reason: `.servo/control-state.md` and `.servo/goal-charter.md` now exist, but no worktrack contract has been initialized.

## Dispatch Handoff Packet

- task: N/A
- goal_for_this_round: N/A
- node_type: N/A
- gate_criteria_for_this_round: N/A
- baseline_policy: N/A
- constraints_for_this_round: N/A
- acceptance_criteria_for_this_round: N/A
- verification_requirements: N/A
- runtime_dispatch_mode: auto
- done_signal: N/A
- required_context: N/A
- return_to_schedule_if: N/A

## Readiness

- dispatch_packet_ready: false
- recommended_next_route: RepoScope.Observe

## Notes

- This queue is intentionally inactive until RepoScope.Decide selects a worktrack and `init-worktrack-skill` creates a scoped plan.
