# Gate Evidence: WT-20260528-065

## Metadata

- worktrack_id: WT-20260528-065
- title: AI 多方向追问策略
- milestone_id: MS-20260528-003
- node_type: feature
- collected_at: 2026-05-28
- branch: worktrack/wt-20260528-065-ai-clarification-directions

## Implementation Evidence

- Extended provider-neutral AI clarification types with fixed direction groups while preserving flat `questions` compatibility.
- Updated Deepseek/OpenAI-compatible prompt contract to request exactly `知识库依据 / 应用场景 / 需求细节` direction groups.
- Normalized provider clarification responses so each fixed direction is present and each direction is capped at 5 questions.
- Preserved old flat `questions[]` responses by mapping them into `需求细节` with old-style `q1`, `q2` fallback ids.
- Updated `/tickets/ai-discussion` to render grouped direction labels and use one unified answer area.
- Kept draft generation separate from clarification; draft mode still uses existing max-3 cap and single selected draft handoff.

## Validation Evidence

- `npm run lint`: pass.
- Focused tests: pass, 3 files / 23 tests.
  - `src/lib/ai/deepseek-provider.test.ts`
  - `src/lib/ai/draft-service.test.ts`
  - `src/app/api/ai/draft/route.test.ts`
- `npm run test`: pass, 28 files / 194 tests.
- `npm run build`: pass.
  - Note: Next.js emitted a worktree root inference warning because the worktree has its own `package-lock.json`; build completed successfully.

## Policy Evidence

- No database schema or migration was changed.
- No provider secret handling moved into the client.
- No automatic ticket creation or mutation was added.
- Clarification mode only asks questions; draft mode remains the only draft generation path.
- Milestone final acceptance remains fdch0-only.

## Gate Verdict

- implementation_gate: pass
- validation_gate: pass
- policy_gate: pass
- final_verdict: pass
