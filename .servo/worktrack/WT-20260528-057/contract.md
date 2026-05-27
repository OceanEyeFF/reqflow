# Worktrack Contract: WT-20260528-057

## Metadata

- worktrack_id: WT-20260528-057
- title: AI 草稿创建工单与追问渲染修复
- milestone_id: MS-20260527-001
- derived_from_user_feedback: true
- node_type: fix
- status: active
- created_at: 2026-05-28
- updated: 2026-05-28

## Scope

### Goal

Fix two MS7 acceptance-blocking AI discussion issues: accepted AI drafts must be clearly confirmable before ticket creation, and AI clarification questions must render reliably.

### In Scope

- Add an explicit confirmation control/state on the new ticket page for loaded AI drafts before enabling manual ticket creation.
- Show backend ticket creation errors instead of silently leaving the user blocked.
- Normalize AI clarification provider responses so questions render when providers return either top-level `questions` or nested `result.questions`.
- Add regression tests for draft handoff confirmation metadata and clarification normalization.

### Out of Scope

- Language selection for AI responses.
- Multiple alternative drafts or requirement splitting.
- Broad docs cleanup.
- Provider implementation redesign or external API smoke tests.

## Acceptance Criteria

1. A loaded AI draft shows a confirm action distinct from clearing the draft.
2. Creating a ticket from an AI draft is disabled until the user confirms the loaded draft.
3. Ticket creation failures are visible to the user.
4. Clarification questions render for common provider JSON shapes.
5. `npm run lint`, `npm run test`, and `npm run build` pass.
