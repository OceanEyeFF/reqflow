# Worktrack Contract: WT-20260529-089

## Metadata

- worktrack_id: WT-20260529-089
- title: AI draft hybrid context 接入
- milestone_id: MS-11
- node_type: feature
- status: completed
- branch: worktrack/wt-20260529-089-ai-draft-hybrid-context
- created_by: harness-kernel
- created_at: 2026-05-31 22:19:42 +08:00
- completed_at: 2026-05-31 22:27:00 +08:00

## Task Goal

将 AI draft request 的知识上下文来源接入 MS-10 的 hybrid retrieval / Context Window Builder，使 provider 只接收经过知识库范围过滤、enabled/archived/source/snippet 过滤、hybrid fusion、上下文裁剪和 citation provenance 约束的知识上下文。

## Scope

- Replace AI draft persisted knowledge selection with `buildHybridContextWindow`.
- Preserve selected `knowledgeBaseIds` behavior.
- Keep provider context capped.
- Preserve built-in fallback snippets only when no knowledge base scope is selected.
- Do not implement citation UI, admin debug surface, end-to-end manual scenario evidence, docs catch-up, or local embedding sidecar PoC in this worktrack.

## Acceptance Criteria

1. AI draft provider request uses hybrid retrieval context citations.
2. Selected knowledge bases are passed into hybrid retrieval and no built-in snippets are appended when a selection exists.
3. Provider context has an explicit cap.
4. Existing AI draft clarify/draft behavior and manual ticket confirmation boundary remain unchanged.
5. Focused AI tests pass, plus lint/build as validation budget allows.

## Evidence Targets

- `src/lib/ai/knowledge.test.ts`
- `src/lib/ai/draft-service.test.ts`
- `src/app/api/ai/draft/route.test.ts`
- `npm run lint`
- `npm run build`
