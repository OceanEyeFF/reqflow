import { prisma } from "@/lib/prisma";
import type { KnowledgeCitation } from "@/lib/ai/types";
import { Prisma } from "@prisma/client";
import { retrieveVectorCandidates, type EmbeddingProvider, type VectorRetrievalResult } from "./embeddings";
import { ACTIVE_LEXICAL_ENGINE, type LexicalEngineId } from "./lexical-engines";

const MAX_PERSISTED_SNIPPETS = 3;
const MAX_CANDIDATES = 100;
const RRF_K = 60;
const DEFAULT_CONTEXT_MAX_CHARS = 1600;
const DEFAULT_CONTEXT_ADJACENT_CHUNKS = 1;

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
  engine: LexicalEngineId;
  score: number;
  matchedTerms: string[];
  mustTerms: string[];
  mustTermsMatched: string[];
  lexicalTextSource: "metadata" | "content";
};

export type KnowledgeRetrievalDebugEvidence = {
  query: QueryUnderstanding;
  engine: LexicalEngineId;
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

export type HybridRetrievalOptions = KnowledgeRetrievalOptions & {
  vectorProvider?: EmbeddingProvider;
  reranker?: HybridReranker;
};

export type ContextWindowOptions = HybridRetrievalOptions & {
  maxContextChars?: number;
  adjacentChunks?: number;
};

export type HybridReranker = {
  name: string;
  rerank(input: HybridFusedHitEvidence[]): Promise<HybridFusedHitEvidence[]>;
};

export type HybridFusedHitEvidence = {
  snippetId: string;
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  fusedRank: number;
  fusedScore: number;
  lexicalRank?: number;
  lexicalScore?: number;
  vectorRank?: number;
  vectorScore?: number;
  rrf: {
    k: number;
    lexicalContribution: number;
    vectorContribution: number;
  };
};

export type HybridRetrievalDebugEvidence = {
  query: QueryUnderstanding;
  mode: "hybrid-rrf";
  fusion: {
    algorithm: "reciprocal-rank-fusion";
    k: number;
    rawScoreAddition: false;
  };
  vectorLane:
    | { status: "ready"; candidatesReturned: number }
    | { status: "failed"; reason: string; evidence: Record<string, unknown> };
  reranker: {
    name: string;
    ran: boolean;
    acceptedCandidates: number;
    rejectedCandidates: number;
  };
  lexicalEvidence: KnowledgeRetrievalDebugEvidence;
  vectorHits: VectorRetrievalResult["vectorHits"];
  fusedHits: HybridFusedHitEvidence[];
};

export type HybridRetrievalResult = {
  citations: KnowledgeCitation[];
  debugEvidence: HybridRetrievalDebugEvidence;
};

export type ContextSnippetEvidence = {
  snippetId: string;
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  chunkIndex: number;
  reason: "selected-hit" | "adjacent";
  chars: number;
};

export type CitationGroup = {
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  snippetIds: string[];
  snippets: string[];
};

export type ContextWindowResult = {
  contextText: string;
  citations: KnowledgeCitation[];
  citationGroups: CitationGroup[];
  debugEvidence: HybridRetrievalDebugEvidence & {
    contextWindow: {
      maxContextChars: number;
      adjacentChunks: number;
      included: ContextSnippetEvidence[];
      dedupedSnippetIds: string[];
      cappedSnippetIds: string[];
      skippedSnippetIds: string[];
    };
  };
};

type HybridVectorLaneResult =
  | {
      status: "ready";
      candidatesReturned: number;
      vectorHits: VectorRetrievalResult["vectorHits"];
    }
  | {
      status: "failed";
      reason: string;
      evidence: Record<string, unknown>;
      vectorHits: [];
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

  const candidates = await findLexicalCandidates(query, knowledgeBaseIds);
  const ranked = candidates
    .map((candidate) => scoreLexicalHit(candidate, query))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.candidate.ftsRank - a.candidate.ftsRank || b.score - a.score || a.candidate.chunkIndex - b.candidate.chunkIndex);
  const selected = ranked.slice(0, MAX_PERSISTED_SNIPPETS);
  const lexicalHits = selected.map(({ candidate, score, matchedTerms, lexicalTextSource }, index) => ({
    snippetId: candidate.snippetId,
    sourceId: `kb-${candidate.sourceId}`,
    sourceTitle: candidate.sourceTitle,
    path: candidate.sourcePath,
    section: candidate.section ?? undefined,
    rank: index + 1,
    engine: ACTIVE_LEXICAL_ENGINE.id,
    score,
    matchedTerms,
    mustTerms: query.mustTerms,
    mustTermsMatched: query.mustTerms.filter((term) => matchedTerms.includes(term)),
    lexicalTextSource,
  }));

  return {
    citations: selected.map(({ candidate }) => ({
      sourceId: `kb-${candidate.sourceId}`,
      sourceTitle: candidate.sourceTitle,
      path: candidate.sourcePath,
      section: candidate.section ?? undefined,
      snippet: candidate.content,
      freshness: `imported ${candidate.versionCreatedAt.toISOString()} v${candidate.versionVersion}`,
    })),
    debugEvidence: createDebugEvidence(query, knowledgeBaseIds, lexicalHits, candidates.length),
  };
}

export async function retrieveHybridKnowledgeSnippets(
  requirement: string,
  options: HybridRetrievalOptions = {}
): Promise<HybridRetrievalResult> {
  const lexical = await retrieveKnowledgeSnippets(requirement, options);
  const query = lexical.debugEvidence.query;
  const vector =
    query.mustTerms.length === 0
      ? createSkippedVectorResult("empty-query")
      : await retrieveVectorCandidatesSafely(query.embeddingQuery, {
          knowledgeBaseIds: options.knowledgeBaseIds,
          provider: options.vectorProvider,
          limit: MAX_PERSISTED_SNIPPETS,
        });

  const fusedBeforeRerank = fuseWithRrf(lexical.debugEvidence.lexicalHits, vector.vectorHits);
  const reranker = options.reranker;
  const reranked = reranker ? await reranker.rerank(fusedBeforeRerank) : fusedBeforeRerank;
  const sanitized = sanitizeRerankerOutput(reranked, fusedBeforeRerank);
  const fusedHits = sanitized.accepted.map((hit, index) => ({
    ...hit,
    fusedRank: index + 1,
  }));
  const citations = await citationsForFusedHits(fusedHits);

  return {
    citations,
    debugEvidence: {
      query,
      mode: "hybrid-rrf",
      fusion: {
        algorithm: "reciprocal-rank-fusion",
        k: RRF_K,
        rawScoreAddition: false,
      },
      vectorLane:
        vector.status === "ready"
          ? { status: "ready", candidatesReturned: vector.candidatesReturned }
          : { status: "failed", reason: vector.reason, evidence: vector.evidence as Record<string, unknown> },
      reranker: {
        name: reranker?.name ?? "none",
        ran: Boolean(reranker),
        acceptedCandidates: sanitized.accepted.length,
        rejectedCandidates: sanitized.rejectedCount,
      },
      lexicalEvidence: lexical.debugEvidence,
      vectorHits: vector.vectorHits,
      fusedHits,
    },
  };
}

export async function buildHybridContextWindow(
  requirement: string,
  options: ContextWindowOptions = {}
): Promise<ContextWindowResult> {
  const hybrid = await retrieveHybridKnowledgeSnippets(requirement, options);
  const maxContextChars = Math.max(1, options.maxContextChars ?? DEFAULT_CONTEXT_MAX_CHARS);
  const adjacentChunks = Math.max(0, options.adjacentChunks ?? DEFAULT_CONTEXT_ADJACENT_CHUNKS);
  const fusedSnippetIds = hybrid.debugEvidence.fusedHits.map((hit) => hit.snippetId);
  const snippets = await loadContextSnippets(fusedSnippetIds, {
    knowledgeBaseIds: options.knowledgeBaseIds,
    adjacentChunks,
  });
  const selectedIds = new Set(fusedSnippetIds);
  const selectedOrder = new Map(fusedSnippetIds.map((id, index) => [id, index]));
  const included: ContextSnippetEvidence[] = [];
  const dedupedSnippetIds: string[] = [];
  const cappedSnippetIds: string[] = [];
  const skippedSnippetIds: string[] = [];
  const seen = new Set<string>();
  let usedChars = 0;
  const contextParts: string[] = [];

  for (const snippet of orderContextSnippets(snippets, selectedIds, selectedOrder)) {
    if (seen.has(snippet.id)) {
      dedupedSnippetIds.push(snippet.id);
      continue;
    }
    seen.add(snippet.id);
    const reason = selectedIds.has(snippet.id) ? "selected-hit" : "adjacent";
    const separatorChars = contextParts.length > 0 ? 2 : 0;
    const nextChars = snippet.content.length + separatorChars;
    if (usedChars + nextChars > maxContextChars) {
      cappedSnippetIds.push(snippet.id);
      continue;
    }
    usedChars += nextChars;
    included.push({
      snippetId: snippet.id,
      sourceId: `kb-${snippet.sourceId}`,
      sourceTitle: snippet.source.title,
      path: snippet.sourcePath,
      section: snippet.section ?? undefined,
      chunkIndex: snippet.chunkIndex,
      reason,
      chars: nextChars,
    });
    contextParts.push(snippet.content);
  }

  const includedIds = new Set(included.map((item) => item.snippetId));
  for (const snippet of orderContextSnippets(snippets, selectedIds, selectedOrder)) {
    if (!includedIds.has(snippet.id) && !cappedSnippetIds.includes(snippet.id) && !dedupedSnippetIds.includes(snippet.id)) {
      skippedSnippetIds.push(snippet.id);
    }
  }

  return {
    contextText: contextParts.join("\n\n"),
    citations: citationsFromContextSnippets(snippets.filter((snippet) => includedIds.has(snippet.id))),
    citationGroups: groupContextCitations(snippets.filter((snippet) => includedIds.has(snippet.id))),
    debugEvidence: {
      ...hybrid.debugEvidence,
      contextWindow: {
        maxContextChars,
        adjacentChunks,
        included,
        dedupedSnippetIds,
        cappedSnippetIds,
        skippedSnippetIds,
      },
    },
  };
}

async function retrieveVectorCandidatesSafely(
  query: string,
  options: {
    knowledgeBaseIds?: string[];
    provider?: EmbeddingProvider;
    limit?: number;
  }
): Promise<HybridVectorLaneResult> {
  try {
    const result = await retrieveVectorCandidates(query, options);
    if (result.status === "ready") {
      return {
        status: "ready",
        candidatesReturned: result.candidatesReturned,
        vectorHits: result.vectorHits,
      };
    }
    return {
      status: "failed",
      reason: result.reason,
      evidence: result.evidence as Record<string, unknown>,
      vectorHits: [],
    };
  } catch (error) {
    return {
      status: "failed",
      reason: "vector-exception",
      evidence: { message: error instanceof Error ? error.message : "Unknown vector retrieval error" },
      vectorHits: [],
    };
  }
}

function createSkippedVectorResult(reason: string): HybridVectorLaneResult {
  return {
    status: "failed",
    reason,
    evidence: {},
    vectorHits: [],
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

type LexicalCandidateRow = {
  snippetId: string;
  sourceId: string;
  sourceTitle: string;
  sourcePath: string;
  section: string | null;
  content: string;
  chunkIndex: number;
  versionCreatedAt: Date;
  versionVersion: number;
  lexicalText: string | null;
  documentTitle: string | null;
  domainEntities: string[] | null;
  processNames: string[] | null;
  materialTypes: string[] | null;
  approvalActions: string[] | null;
  applicabilityRules: string[] | null;
  ftsRank: number;
};

async function findLexicalCandidates(query: QueryUnderstanding, knowledgeBaseIds: string[]): Promise<LexicalCandidateRow[]> {
  const ftsQuery = query.mustTerms.join(" OR ");
  const likeConditions = query.mustTerms.map((term) => Prisma.sql`lower("searchText") LIKE ${`%${term.toLowerCase()}%`}`);
  const knowledgeBaseFilter =
    knowledgeBaseIds.length > 0 ? Prisma.sql`AND source."knowledgeBaseId" IN (${Prisma.join(knowledgeBaseIds)})` : Prisma.empty;

  return prisma.$queryRaw<LexicalCandidateRow[]>`
    WITH candidates AS (
      SELECT
        s."id" AS "snippetId",
        s."sourceId",
        source."title" AS "sourceTitle",
        s."sourcePath",
        s."section",
        s."content",
        s."chunkIndex",
        version."createdAt" AS "versionCreatedAt",
        version."version" AS "versionVersion",
        metadata."lexicalText",
        metadata."documentTitle",
        metadata."domainEntities",
        metadata."processNames",
        metadata."materialTypes",
        metadata."approvalActions",
        metadata."applicabilityRules",
        concat_ws(
          ' ',
          metadata."lexicalText",
          metadata."documentTitle",
          array_to_string(metadata."domainEntities", ' '),
          array_to_string(metadata."processNames", ' '),
          array_to_string(metadata."materialTypes", ' '),
          array_to_string(metadata."approvalActions", ' '),
          array_to_string(metadata."applicabilityRules", ' '),
          s."content"
        ) AS "searchText"
      FROM "KnowledgeSnippet" s
      JOIN "KnowledgeSource" source ON source."id" = s."sourceId"
      JOIN "KnowledgeSourceVersion" version ON version."id" = s."versionId"
      JOIN "KnowledgeBase" kb ON kb."id" = source."knowledgeBaseId"
      LEFT JOIN "KnowledgeSnippetSearchMetadata" metadata ON metadata."snippetId" = s."id"
      WHERE s."enabled" = true
        AND source."enabled" = true
        AND source."status" IN ('ready', 'enabled')
        AND version."status" = 'ready'
        AND kb."enabled" = true
        ${knowledgeBaseFilter}
    ),
    ranked AS (
      SELECT
        *,
        to_tsvector('simple', "searchText") AS "searchVector",
        websearch_to_tsquery('simple', ${ftsQuery}) AS "queryVector"
      FROM candidates
    )
    SELECT
      "snippetId",
      "sourceId",
      "sourceTitle",
      "sourcePath",
      "section",
      "content",
      "chunkIndex",
      "versionCreatedAt",
      "versionVersion",
      "lexicalText",
      "documentTitle",
      "domainEntities",
      "processNames",
      "materialTypes",
      "approvalActions",
      "applicabilityRules",
      ts_rank_cd("searchVector", "queryVector")::double precision AS "ftsRank"
    FROM ranked
    WHERE "searchVector" @@ "queryVector"
      OR (${Prisma.join(likeConditions, " OR ")})
    ORDER BY "ftsRank" DESC, "chunkIndex" ASC, "snippetId" ASC
    LIMIT ${MAX_CANDIDATES}
  `;
}

function scoreLexicalHit(candidate: LexicalCandidateRow, query: QueryUnderstanding) {
  const hasMetadata = Boolean(candidate.lexicalText);
  const lexicalText = hasMetadata
    ? [
        candidate.lexicalText,
        candidate.documentTitle,
        candidate.domainEntities?.join(" "),
        candidate.processNames?.join(" "),
        candidate.materialTypes?.join(" "),
        candidate.approvalActions?.join(" "),
        candidate.applicabilityRules?.join(" "),
      ].filter(Boolean).join(" ")
    : candidate.content;
  const haystack = normalizeSearchText(lexicalText);
  const matchedTerms = query.mustTerms.filter((term) => haystack.includes(term));
  const entityMatches = query.domainEntities.filter((entity) => haystack.includes(entity));
  const score = candidate.ftsRank * 100 + matchedTerms.length * 10 + entityMatches.length * 3;

  return {
    candidate,
    score,
    matchedTerms,
    lexicalTextSource: hasMetadata ? ("metadata" as const) : ("content" as const),
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
    engine: ACTIVE_LEXICAL_ENGINE.id,
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

function fuseWithRrf(
  lexicalHits: LexicalHitEvidence[],
  vectorHits: VectorRetrievalResult["vectorHits"]
): HybridFusedHitEvidence[] {
  const bySnippet = new Map<string, HybridFusedHitEvidence>();

  for (const hit of lexicalHits) {
    const lexicalContribution = rrfContribution(hit.rank);
    bySnippet.set(hit.snippetId, {
      snippetId: hit.snippetId,
      sourceId: hit.sourceId,
      sourceTitle: hit.sourceTitle,
      path: hit.path,
      section: hit.section,
      fusedRank: 0,
      fusedScore: lexicalContribution,
      lexicalRank: hit.rank,
      lexicalScore: hit.score,
      rrf: {
        k: RRF_K,
        lexicalContribution,
        vectorContribution: 0,
      },
    });
  }

  for (const hit of vectorHits) {
    const vectorContribution = rrfContribution(hit.rank);
    const existing = bySnippet.get(hit.snippetId);
    if (existing) {
      existing.vectorRank = hit.rank;
      existing.vectorScore = hit.score;
      existing.rrf.vectorContribution = vectorContribution;
      existing.fusedScore = existing.rrf.lexicalContribution + vectorContribution;
      continue;
    }
    bySnippet.set(hit.snippetId, {
      snippetId: hit.snippetId,
      sourceId: hit.sourceId,
      sourceTitle: hit.sourceTitle,
      path: hit.path,
      section: hit.section,
      fusedRank: 0,
      fusedScore: vectorContribution,
      vectorRank: hit.rank,
      vectorScore: hit.score,
      rrf: {
        k: RRF_K,
        lexicalContribution: 0,
        vectorContribution,
      },
    });
  }

  return Array.from(bySnippet.values())
    .sort((a, b) => b.fusedScore - a.fusedScore || (a.lexicalRank ?? a.vectorRank ?? 0) - (b.lexicalRank ?? b.vectorRank ?? 0))
    .slice(0, MAX_PERSISTED_SNIPPETS)
    .map((hit, index) => ({ ...hit, fusedRank: index + 1 }));
}

function rrfContribution(rank: number): number {
  return 1 / (RRF_K + rank);
}

function sanitizeRerankerOutput(
  reranked: HybridFusedHitEvidence[],
  allowed: HybridFusedHitEvidence[]
): { accepted: HybridFusedHitEvidence[]; rejectedCount: number } {
  const allowedById = new Map(allowed.map((hit) => [hit.snippetId, hit]));
  const seen = new Set<string>();
  const accepted: HybridFusedHitEvidence[] = [];
  let rejectedCount = 0;

  for (const candidate of reranked) {
    const original = allowedById.get(candidate.snippetId);
    if (!original || seen.has(candidate.snippetId)) {
      rejectedCount += 1;
      continue;
    }
    seen.add(candidate.snippetId);
    accepted.push(original);
    if (accepted.length === MAX_PERSISTED_SNIPPETS) break;
  }

  return { accepted, rejectedCount: rejectedCount + Math.max(0, reranked.length - seen.size - rejectedCount) };
}

async function citationsForFusedHits(fusedHits: HybridFusedHitEvidence[]): Promise<KnowledgeCitation[]> {
  if (fusedHits.length === 0) return [];
  const order = new Map(fusedHits.map((hit, index) => [hit.snippetId, index]));
  const snippets = await prisma.knowledgeSnippet.findMany({
    where: { id: { in: fusedHits.map((hit) => hit.snippetId) } },
    include: { source: true, version: true },
  });

  return snippets
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((snippet) => ({
      sourceId: `kb-${snippet.sourceId}`,
      sourceTitle: snippet.source.title,
      path: snippet.sourcePath,
      section: snippet.section ?? undefined,
      snippet: snippet.content,
      freshness: `imported ${snippet.version.createdAt.toISOString()} v${snippet.version.version}`,
    }));
}

type ContextSnippet = Prisma.KnowledgeSnippetGetPayload<{
  include: { source: true; version: true };
}>;

async function loadContextSnippets(
  selectedSnippetIds: string[],
  options: { knowledgeBaseIds?: string[]; adjacentChunks: number }
): Promise<ContextSnippet[]> {
  if (selectedSnippetIds.length === 0) return [];
  const knowledgeBaseIds = normalizeKnowledgeBaseIds(options.knowledgeBaseIds);
  const selected = await prisma.knowledgeSnippet.findMany({
    where: {
      id: { in: selectedSnippetIds },
      ...contextSnippetWhere(knowledgeBaseIds),
    },
    include: { source: true, version: true },
  });
  const adjacentFilters = selected.flatMap((snippet) => {
    const start = Math.max(0, snippet.chunkIndex - options.adjacentChunks);
    const end = snippet.chunkIndex + options.adjacentChunks;
    return {
      versionId: snippet.versionId,
      sourceId: snippet.sourceId,
      sourcePath: snippet.sourcePath,
      chunkIndex: { gte: start, lte: end },
    };
  });
  if (adjacentFilters.length === 0) return [];
  const snippets = await prisma.knowledgeSnippet.findMany({
    where: {
      OR: adjacentFilters,
      ...contextSnippetWhere(knowledgeBaseIds),
    },
    include: { source: true, version: true },
  });
  return snippets.sort((a, b) => {
    const sourceCompare = a.sourceId.localeCompare(b.sourceId) || a.sourcePath.localeCompare(b.sourcePath);
    return sourceCompare || a.chunkIndex - b.chunkIndex;
  });
}

function orderContextSnippets(
  snippets: ContextSnippet[],
  selectedIds: Set<string>,
  selectedOrder: Map<string, number>
): ContextSnippet[] {
  return [...snippets].sort((a, b) => {
    const aSelected = selectedIds.has(a.id);
    const bSelected = selectedIds.has(b.id);
    const aOrder = contextGroupOrder(a, snippets, selectedIds, selectedOrder);
    const bOrder = contextGroupOrder(b, snippets, selectedIds, selectedOrder);
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    const sourceCompare = a.sourceId.localeCompare(b.sourceId) || a.sourcePath.localeCompare(b.sourcePath);
    return sourceCompare || a.chunkIndex - b.chunkIndex;
  });
}

function contextGroupOrder(
  snippet: ContextSnippet,
  snippets: ContextSnippet[],
  selectedIds: Set<string>,
  selectedOrder: Map<string, number>
): number {
  const directOrder = selectedOrder.get(snippet.id);
  if (directOrder !== undefined) return directOrder;
  const nearestSelectedId = findNearestSelectedId(snippet, snippets, selectedIds);
  return nearestSelectedId ? selectedOrder.get(nearestSelectedId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
}

function findNearestSelectedId(snippet: ContextSnippet, snippets: ContextSnippet[], selectedIds: Set<string>): string | undefined {
  return snippets
    .filter(
      (candidate) =>
        selectedIds.has(candidate.id) &&
        candidate.sourceId === snippet.sourceId &&
        candidate.versionId === snippet.versionId &&
        candidate.sourcePath === snippet.sourcePath
    )
    .sort((a, b) => Math.abs(a.chunkIndex - snippet.chunkIndex) - Math.abs(b.chunkIndex - snippet.chunkIndex))[0]?.id;
}

function contextSnippetWhere(knowledgeBaseIds: string[]): Prisma.KnowledgeSnippetWhereInput {
  return {
    enabled: true,
    source: {
      enabled: true,
      status: { in: ["ready", "enabled"] },
      knowledgeBaseId: knowledgeBaseIds.length > 0 ? { in: knowledgeBaseIds } : undefined,
      knowledgeBase: { enabled: true },
    },
    version: { status: "ready" },
  };
}

function citationsFromContextSnippets(snippets: ContextSnippet[]): KnowledgeCitation[] {
  return snippets.map((snippet) => ({
    sourceId: `kb-${snippet.sourceId}`,
    sourceTitle: snippet.source.title,
    path: snippet.sourcePath,
    section: snippet.section ?? undefined,
    snippet: snippet.content,
    freshness: `imported ${snippet.version.createdAt.toISOString()} v${snippet.version.version}`,
  }));
}

function groupContextCitations(snippets: ContextSnippet[]): CitationGroup[] {
  const groups = new Map<string, CitationGroup>();
  for (const snippet of [...snippets].sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.sourcePath.localeCompare(b.sourcePath) || a.chunkIndex - b.chunkIndex)) {
    const key = [snippet.sourceId, snippet.sourcePath, snippet.section ?? ""].join("::");
    const group =
      groups.get(key) ??
      {
        sourceId: `kb-${snippet.sourceId}`,
        sourceTitle: snippet.source.title,
        path: snippet.sourcePath,
        section: snippet.section ?? undefined,
        snippetIds: [],
        snippets: [],
      };
    group.snippetIds.push(snippet.id);
    group.snippets.push(snippet.content);
    groups.set(key, group);
  }
  return Array.from(groups.values());
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
