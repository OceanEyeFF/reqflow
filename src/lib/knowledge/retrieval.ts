import { prisma } from "@/lib/prisma";
import type { KnowledgeCitation } from "@/lib/ai/types";

const MAX_PERSISTED_SNIPPETS = 3;

export type KnowledgeRetrievalOptions = {
  knowledgeBaseIds?: string[];
};

export async function selectKnowledgeSnippets(
  requirement: string,
  options: KnowledgeRetrievalOptions = {}
): Promise<KnowledgeCitation[]> {
  const terms = tokenize(requirement);
  if (terms.length === 0) return [];
  const knowledgeBaseIds = normalizeKnowledgeBaseIds(options.knowledgeBaseIds);

  const snippets = await prisma.knowledgeSnippet.findMany({
    where: {
      enabled: true,
      source: {
        enabled: true,
        status: { in: ["ready", "enabled"] },
        knowledgeBaseId: knowledgeBaseIds.length > 0 ? { in: knowledgeBaseIds } : undefined,
        knowledgeBase: { enabled: true },
      },
      version: { status: "ready" },
    },
    include: { source: true, version: true },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return snippets
    .map((snippet) => ({ snippet, score: scoreSnippet(snippet.content, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.snippet.chunkIndex - b.snippet.chunkIndex)
    .slice(0, MAX_PERSISTED_SNIPPETS)
    .map(({ snippet }) => ({
      sourceId: `kb-${snippet.sourceId}`,
      sourceTitle: snippet.source.title,
      path: snippet.sourcePath,
      section: snippet.section ?? undefined,
      snippet: snippet.content,
      freshness: `imported ${snippet.version.createdAt.toISOString()} v${snippet.version.version}`,
    }));
}

function normalizeKnowledgeBaseIds(ids: string[] | undefined): string[] {
  return Array.from(new Set((ids ?? []).map((id) => id.trim()).filter(Boolean)));
}

export function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2)
    )
  ).slice(0, 20);
}

function scoreSnippet(content: string, terms: string[]): number {
  const lowered = content.toLowerCase();
  return terms.reduce((score, term) => score + (lowered.includes(term) ? 1 : 0), 0);
}
