import { prisma } from "@/lib/prisma";
import type { KnowledgeCitation } from "@/lib/ai/types";
import type { Prisma } from "@prisma/client";

const MAX_PERSISTED_SNIPPETS = 3;
const MAX_CANDIDATES = 100;

export type KnowledgeRetrievalOptions = {
  knowledgeBaseIds?: string[];
};

export type QueryUnderstanding = {
  rawQuery: string;
  normalizedQuery: string;
  lexicalQuery: string;
  embeddingQuery: string;
  mustTerms: string[];
  domainEntities: string[];
};

export type LexicalHitEvidence = {
  snippetId: string;
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  rank: number;
  engine: "postgres-native-fts-fallback";
  score: number;
  matchedTerms: string[];
  mustTerms: string[];
  mustTermsMatched: string[];
  lexicalTextSource: "metadata" | "content";
};

export type KnowledgeRetrievalDebugEvidence = {
  query: QueryUnderstanding;
  engine: "postgres-native-fts-fallback";
  filters: {
    knowledgeBaseIds: string[];
    sourceStatuses: string[];
    enabledOnly: true;
    versionStatuses: string[];
  };
  candidatesScanned: number;
  candidatesReturned: number;
  cap: number;
  lexicalHits: LexicalHitEvidence[];
};

export type KnowledgeRetrievalResult = {
  citations: KnowledgeCitation[];
  debugEvidence: KnowledgeRetrievalDebugEvidence;
};

export async function selectKnowledgeSnippets(
  requirement: string,
  options: KnowledgeRetrievalOptions = {}
): Promise<KnowledgeCitation[]> {
  return (await retrieveKnowledgeSnippets(requirement, options)).citations;
}

export async function retrieveKnowledgeSnippets(
  requirement: string,
  options: KnowledgeRetrievalOptions = {}
): Promise<KnowledgeRetrievalResult> {
  const query = understandKnowledgeQuery(requirement);
  if (query.mustTerms.length === 0) {
    return {
      citations: [],
      debugEvidence: createDebugEvidence(query, normalizeKnowledgeBaseIds(options.knowledgeBaseIds), [], 0),
    };
  }
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
    include: { source: true, version: true, searchMetadata: true },
    take: MAX_CANDIDATES,
    orderBy: { createdAt: "desc" },
  });

  const ranked = snippets
    .map((snippet) => scoreLexicalHit(snippet, query))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.snippet.chunkIndex - b.snippet.chunkIndex);
  const selected = ranked.slice(0, MAX_PERSISTED_SNIPPETS);
  const lexicalHits = selected.map(({ snippet, score, matchedTerms, lexicalTextSource }, index) => ({
    snippetId: snippet.id,
    sourceId: `kb-${snippet.sourceId}`,
    sourceTitle: snippet.source.title,
    path: snippet.sourcePath,
    section: snippet.section ?? undefined,
    rank: index + 1,
    engine: "postgres-native-fts-fallback" as const,
    score,
    matchedTerms,
    mustTerms: query.mustTerms,
    mustTermsMatched: query.mustTerms.filter((term) => matchedTerms.includes(term)),
    lexicalTextSource,
  }));

  return {
    citations: selected.map(({ snippet }) => ({
      sourceId: `kb-${snippet.sourceId}`,
      sourceTitle: snippet.source.title,
      path: snippet.sourcePath,
      section: snippet.section ?? undefined,
      snippet: snippet.content,
      freshness: `imported ${snippet.version.createdAt.toISOString()} v${snippet.version.version}`,
    })),
    debugEvidence: createDebugEvidence(query, knowledgeBaseIds, lexicalHits, snippets.length),
  };
}

function normalizeKnowledgeBaseIds(ids: string[] | undefined): string[] {
  return Array.from(new Set((ids ?? []).map((id) => id.trim()).filter(Boolean)));
}

export function understandKnowledgeQuery(input: string): QueryUnderstanding {
  const rawQuery = input;
  const normalizedQuery = normalizeSearchText(input);
  const mustTerms = tokenize(normalizedQuery);
  const domainEntities = extractDomainEntities(normalizedQuery, mustTerms);

  return {
    rawQuery,
    normalizedQuery,
    lexicalQuery: mustTerms.join(" "),
    embeddingQuery: normalizedQuery,
    mustTerms,
    domainEntities,
  };
}

export function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      segmentSearchText(input)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2)
    )
  ).slice(0, 20);
}

type LexicalSnippet = Prisma.KnowledgeSnippetGetPayload<{
  include: { source: true; version: true; searchMetadata: true };
}>;

function scoreLexicalHit(snippet: LexicalSnippet, query: QueryUnderstanding) {
  const metadata = snippet.searchMetadata;
  const lexicalText = metadata
    ? [
        metadata.lexicalText,
        metadata.documentTitle,
        metadata.domainEntities.join(" "),
        metadata.processNames.join(" "),
        metadata.materialTypes.join(" "),
        metadata.approvalActions.join(" "),
        metadata.applicabilityRules.join(" "),
      ].filter(Boolean).join(" ")
    : snippet.content;
  const haystack = normalizeSearchText(lexicalText);
  const matchedTerms = query.mustTerms.filter((term) => haystack.includes(term));
  const entityMatches = query.domainEntities.filter((entity) => haystack.includes(entity));
  const score = matchedTerms.length * 10 + entityMatches.length * 3;

  return {
    snippet,
    score,
    matchedTerms,
    lexicalTextSource: metadata ? ("metadata" as const) : ("content" as const),
  };
}

function createDebugEvidence(
  query: QueryUnderstanding,
  knowledgeBaseIds: string[],
  lexicalHits: LexicalHitEvidence[],
  candidatesScanned: number
): KnowledgeRetrievalDebugEvidence {
  return {
    query,
    engine: "postgres-native-fts-fallback",
    filters: {
      knowledgeBaseIds,
      sourceStatuses: ["ready", "enabled"],
      enabledOnly: true,
      versionStatuses: ["ready"],
    },
    candidatesScanned,
    candidatesReturned: lexicalHits.length,
    cap: MAX_PERSISTED_SNIPPETS,
    lexicalHits,
  };
}

function extractDomainEntities(normalizedQuery: string, terms: string[]): string[] {
  const entities = new Set<string>();
  for (const term of terms) {
    if (/[审批确认流程材料文档路径章节管理员需求工单]/u.test(term)) {
      entities.add(term);
    }
  }
  for (const match of normalizedQuery.matchAll(/[\p{L}\p{N}]+(?:流程|材料|文档|审批|确认|章节|路径)/gu)) {
    entities.add(match[0]);
  }
  return Array.from(entities).slice(0, 20);
}

function normalizeSearchText(input: string): string {
  return input.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function segmentSearchText(input: string): string[] {
  const normalized = normalizeSearchText(input);
  const baseTerms = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const chineseTokens = Array.from(normalized.matchAll(/\p{Script=Han}{2,}/gu)).flatMap(([chunk]) => segmentChineseChunk(chunk));
  return [...baseTerms, ...chineseTokens];
}

function segmentChineseChunk(chunk: string): string[] {
  const tokens = new Set<string>();
  tokens.add(chunk);
  for (let size = 2; size <= Math.min(4, chunk.length); size += 1) {
    for (let index = 0; index <= chunk.length - size; index += 1) {
      tokens.add(chunk.slice(index, index + size));
    }
  }
  return Array.from(tokens);
}
