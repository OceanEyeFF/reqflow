export const AI_DRAFT_STORAGE_KEY = "reqflow.aiDraft";

export type DraftCitation = {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
};

export type AiRequirementDraft = {
  title: string;
  background: string;
  userStory: string;
  acceptanceCriteria: string[];
  pendingQuestions: string[];
  suggestedPriority: "low" | "medium" | "high" | "urgent";
  citations: DraftCitation[];
};

export type StagedAiDraft = {
  title: string;
  description: string;
  type: string;
  priority: string;
  stagedAt: string;
  confirmedAt?: string;
};

type DraftStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function formatDraftDescription(draft: AiRequirementDraft): string {
  const sections = [
    ["背景", draft.background],
    ["用户故事", draft.userStory],
    ["验收标准", numberedList(draft.acceptanceCriteria)],
    ["待确认问题", numberedList(draft.pendingQuestions)],
    [
      "引用片段",
      draft.citations.map((citation) => `- ${citation.sourceTitle}: ${citation.snippet}`).join("\n"),
    ],
  ];

  return sections
    .filter(([, content]) => content.trim().length > 0)
    .map(([title, content]) => `${title}\n${content}`)
    .join("\n\n");
}

export function stageAiDraft(
  storage: DraftStorage,
  draft: AiRequirementDraft,
  stagedAt = new Date().toISOString()
): StagedAiDraft {
  const stagedDraft = {
    title: draft.title,
    description: formatDraftDescription(draft),
    type: "需求",
    priority: draft.suggestedPriority,
    stagedAt,
  };

  storage.setItem(AI_DRAFT_STORAGE_KEY, JSON.stringify(stagedDraft));
  return stagedDraft;
}

export function confirmStagedAiDraft(
  storage: DraftStorage,
  confirmedAt = new Date().toISOString()
): StagedAiDraft | null {
  const draft = readStagedAiDraft(storage);
  if (!draft) return null;

  const confirmedDraft = { ...draft, confirmedAt };
  storage.setItem(AI_DRAFT_STORAGE_KEY, JSON.stringify(confirmedDraft));
  return confirmedDraft;
}

export function readStagedAiDraft(storage?: DraftStorage): StagedAiDraft | null {
  if (!storage) return null;

  const storedDraft = storage.getItem(AI_DRAFT_STORAGE_KEY);
  if (!storedDraft) return null;

  const draft = parseStagedAiDraft(storedDraft);
  if (!draft) {
    storage.removeItem(AI_DRAFT_STORAGE_KEY);
  }

  return draft;
}

export function parseStagedAiDraft(storedDraft: string | null): StagedAiDraft | null {
  if (!storedDraft) return null;

  try {
    const draft = JSON.parse(storedDraft) as Partial<StagedAiDraft>;
    if (
      typeof draft.title !== "string" ||
      typeof draft.description !== "string" ||
      typeof draft.type !== "string" ||
      typeof draft.priority !== "string" ||
      typeof draft.stagedAt !== "string"
    ) {
      return null;
    }

    return {
      title: draft.title,
      description: draft.description,
      type: draft.type,
      priority: draft.priority,
      stagedAt: draft.stagedAt,
      confirmedAt: typeof draft.confirmedAt === "string" ? draft.confirmedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function clearStagedAiDraft(storage: DraftStorage): void {
  storage.removeItem(AI_DRAFT_STORAGE_KEY);
}

function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}
