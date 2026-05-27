import { describe, expect, it } from "vitest";
import {
  AI_DRAFT_STORAGE_KEY,
  clearStagedAiDraft,
  confirmStagedAiDraft,
  formatDraftDescription,
  parseStagedAiDraft,
  readStagedAiDraft,
  stageAiDraft,
  type AiRequirementDraft,
} from "./draft-handoff";

function createMemoryStorage(seed?: Record<string, string>) {
  const data = new Map(Object.entries(seed ?? {}));

  return {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

const draft: AiRequirementDraft = {
  title: "审批流",
  background: "目前审批状态需要人工追踪",
  userStory: "作为项目经理，我要看到审批进度",
  acceptanceCriteria: ["能看到当前审批人", "能看到审批历史"],
  pendingQuestions: ["是否需要通知？"],
  suggestedPriority: "high",
  citations: [
    {
      sourceId: "rf-ai-mvp-boundary",
      sourceTitle: "AI MVP technical boundary",
      snippet: "AI output is advisory until the user explicitly confirms it.",
    },
  ],
};

describe("AI draft handoff", () => {
  it("formats a deterministic editable ticket description", () => {
    expect(formatDraftDescription(draft)).toBe(
      [
        "背景\n目前审批状态需要人工追踪",
        "用户故事\n作为项目经理，我要看到审批进度",
        "验收标准\n1. 能看到当前审批人\n2. 能看到审批历史",
        "待确认问题\n1. 是否需要通知？",
        "引用片段\n- AI MVP technical boundary: AI output is advisory until the user explicitly confirms it.",
      ].join("\n\n")
    );
  });

  it("stages accepted drafts in caller-provided browser storage", () => {
    const storage = createMemoryStorage();

    const stagedDraft = stageAiDraft(storage, draft, "2026-05-27T00:00:00.000Z");

    expect(stagedDraft).toMatchObject({
      title: "审批流",
      type: "需求",
      priority: "high",
      stagedAt: "2026-05-27T00:00:00.000Z",
    });
    expect(readStagedAiDraft(storage)).toEqual(stagedDraft);
  });

  it("clears invalid staged drafts before prefill", () => {
    const storage = createMemoryStorage({
      [AI_DRAFT_STORAGE_KEY]: JSON.stringify({ title: "missing required fields" }),
    });

    expect(readStagedAiDraft(storage)).toBeNull();
    expect(storage.getItem(AI_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("parses staged drafts without mutating storage", () => {
    expect(parseStagedAiDraft("{bad-json")).toBeNull();
    expect(parseStagedAiDraft(JSON.stringify({ title: "missing fields" }))).toBeNull();
    expect(parseStagedAiDraft(JSON.stringify(stageAiDraft(createMemoryStorage(), draft)))).toMatchObject({
      title: "审批流",
      type: "需求",
    });
  });

  it("supports manual discard of staged drafts", () => {
    const storage = createMemoryStorage();
    stageAiDraft(storage, draft, "2026-05-27T00:00:00.000Z");

    clearStagedAiDraft(storage);

    expect(readStagedAiDraft(storage)).toBeNull();
  });

  it("records explicit confirmation before ticket creation", () => {
    const storage = createMemoryStorage();
    stageAiDraft(storage, draft, "2026-05-27T00:00:00.000Z");

    const confirmed = confirmStagedAiDraft(storage, "2026-05-27T00:01:00.000Z");

    expect(confirmed).toMatchObject({ title: "审批流", confirmedAt: "2026-05-27T00:01:00.000Z" });
    expect(readStagedAiDraft(storage)).toMatchObject({ confirmedAt: "2026-05-27T00:01:00.000Z" });
  });
});
