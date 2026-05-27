# Milestone Backlog

> Pipeline 中所有 milestone 的注册表，按 priority 排序。

## Pipeline Summary

- total: 8
- planned: 1
- active: 1
- completed: 6
- superseded: 0

## Milestones

### MS-20260523-001

- milestone_id: MS-20260523-001
- title: 项目基本面更新
- milestone_kind: goal-driven
- status: completed
- priority: 1
- depends_on_milestones: []
- worktrack_list: [WT-20260523-001, WT-20260523-002, WT-20260523-003, WT-20260523-004]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-24
- updated_by: harness-kernel
- accepted_by: fdch0
- accepted_at: 2026-05-24

### MS-20260523-002

- milestone_id: MS-20260523-002
- title: 分模块代码质量治理
- milestone_kind: goal-driven
- status: completed
- priority: 2
- depends_on_milestones: [MS-20260523-001]
- worktrack_list: [WT-20260523-005, WT-20260523-006, WT-20260523-007, WT-20260523-008, WT-20260523-009, WT-20260523-010]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-23
- updated_by: harness-kernel

### MS-20260523-003

- milestone_id: MS-20260523-003
- title: API route handler 集成测试
- milestone_kind: goal-driven
- status: completed
- priority: 3
- depends_on_milestones: [MS-20260523-002]
- worktrack_list: [WT-20260523-011, WT-20260523-012, WT-20260523-013, WT-20260523-014, WT-20260523-015]
- created_by: harness-kernel
- created_at: 2026-05-23
- updated: 2026-05-23
- updated_by: harness-kernel

### MS-20260524-001

- milestone_id: MS-20260524-001
- title: 项目整洁度与 AI 适配治理
- milestone_kind: goal-driven
- status: completed
- priority: 4
- depends_on_milestones: [MS-20260523-003]
- worktrack_list: [WT-20260524-018, WT-20260524-019, WT-20260524-020, WT-20260524-021, WT-20260524-022, WT-20260524-023, WT-20260524-024]
- created_by: fdch0
- created_at: 2026-05-24
- updated: 2026-05-26
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-26 23:33:49 +08:00

### MS-20260526-001

- milestone_id: MS-20260526-001
- title: GitHub CI 与上云前决策基线
- milestone_kind: goal-driven
- status: completed
- priority: 5
- depends_on_milestones: [MS-20260524-001]
- worktrack_list: [WT-20260526-025, WT-20260526-026, WT-20260526-027, WT-20260526-028, WT-20260526-029, WT-20260526-030, WT-20260526-037, WT-20260526-038]
- created_by: fdch0
- created_at: 2026-05-26
- updated: 2026-05-27
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-27 14:47:38 +08:00

### MS-20260526-002

- milestone_id: MS-20260526-002
- title: AI 需求生成 Discussion MVP
- milestone_kind: goal-driven
- status: completed
- priority: 6
- depends_on_milestones: [MS-20260526-001]
- worktrack_list: [WT-20260526-031, WT-20260526-032, WT-20260526-033, WT-20260526-034, WT-20260526-035, WT-20260526-036, WT-20260527-046, WT-20260527-047]
- created_by: fdch0
- created_at: 2026-05-26
- updated: 2026-05-27
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- accepted_by: fdch0
- accepted_at: 2026-05-27

### MS-20260527-001

- milestone_id: MS-20260527-001
- title: 管理员项目知识库管理与导入
- milestone_kind: goal-driven
- status: active
- priority: 7
- depends_on_milestones: [MS-20260526-002]
- worktrack_list: [WT-20260527-039, WT-20260527-045, WT-20260527-040, WT-20260527-041, WT-20260527-042, WT-20260527-043, WT-20260527-044, WT-20260528-048, WT-20260528-049, WT-20260528-050, WT-20260528-057]
- created_by: fdch0
- created_at: 2026-05-27
- updated: 2026-05-28
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
- acceptance_reopened: 2026-05-28 user upload UI feedback
- pending_addenda: []
- latest_addendum_completed: WT-20260528-050 at a53e00f
- latest_acceptance_blocker_fix: WT-20260528-057 at 3fd4581
- acceptance_handback_status: ready_for_programmer_acceptance_after_addenda

### MS-20260528-001

- milestone_id: MS-20260528-001
- title: 知识库文件夹化管理与模块化 AI 草稿范围
- milestone_kind: goal-driven
- status: planned
- priority: 8
- depends_on_milestones: [MS-20260527-001]
- worktrack_list: [WT-20260528-051, WT-20260528-052, WT-20260528-053, WT-20260528-054, WT-20260528-055, WT-20260528-056, WT-20260528-058, WT-20260528-059, WT-20260528-060]
- created_by: fdch0
- created_at: 2026-05-28
- updated: 2026-05-28
- updated_by: harness-kernel
- activation_rules: current_active_milestone == none and depends_on_milestones completed
