import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_VECTOR_LIMIT = 5;
const MAX_VECTOR_LIMIT = 50;
const DETERMINISTIC_TEST_PROVIDER = "deterministic-test";

type ActiveSearchIndexProfile = Prisma.SearchIndexProfileGetPayload<{
  include: { embeddingProviderConfig: true };
}>;

export type EmbeddingProviderRequest = {
  input: string;
  model: string;
  dimensions: number;
};

export type EmbeddingProviderResult = {
  vector: number[];
  provider: string;
  model: string;
  dimensions: number;
};

export type EmbeddingProvider = {
  name: string;
  embed(request: EmbeddingProviderRequest): Promise<EmbeddingProviderResult>;
};

export type EmbeddingGenerationResult =
  | {
      status: "ready";
      embeddingId: string;
      snippetId: string;
      profileId: string;
      model: string;
      dimensions: number;
      contentHash: string;
      provider: string;
    }
  | {
      status: "failed";
      reason: EmbeddingFailureReason;
      evidence: EmbeddingFailureEvidence;
    };

export type EmbeddingFailureReason =
  | "active-profile-missing"
  | "active-profile-ambiguous"
  | "active-profile-not-ready"
  | "provider-config-unavailable"
  | "provider-unavailable"
  | "provider-disabled"
  | "provider-output-mismatch"
  | "dimensions-mismatch"
  | "snippet-unavailable";

export type EmbeddingFailureEvidence = {
  profileId?: string;
  profileStatus?: string;
  profileIsActive?: boolean;
  expectedDimensions?: number;
  actualDimensions?: number;
  provider?: string;
  model?: string;
  snippetId?: string;
};

export type VectorCandidateEvidence = {
  snippetId: string;
  embeddingId: string;
  profileId: string;
  sourceId: string;
  sourceTitle: string;
  path: string;
  section?: string;
  rank: number;
  distance: number;
  score: number;
  model: string;
  dimensions: number;
};

export type VectorRetrievalResult =
  | {
      status: "ready";
      query: string;
      profileId: string;
      provider: string;
      model: string;
      dimensions: number;
      candidatesReturned: number;
      vectorHits: VectorCandidateEvidence[];
    }
  | {
      status: "failed";
      reason: EmbeddingFailureReason;
      evidence: EmbeddingFailureEvidence;
      vectorHits: [];
    };

export function createDeterministicTestEmbeddingProvider(): EmbeddingProvider {
  return {
    name: DETERMINISTIC_TEST_PROVIDER,
    async embed(request) {
      return {
        vector: deterministicVector(request.input, request.dimensions),
        provider: DETERMINISTIC_TEST_PROVIDER,
        model: request.model,
        dimensions: request.dimensions,
      };
    },
  };
}

export async function generateKnowledgeSnippetEmbedding(
  snippetId: string,
  provider: EmbeddingProvider = createDeterministicTestEmbeddingProvider()
): Promise<EmbeddingGenerationResult> {
  const profileResult = await getReadyActiveSearchIndexProfile();
  if (profileResult.status === "failed") return profileResult;
  const profile = profileResult.profile;
  const providerGuard = validateProviderForProfile(profile, provider);
  if (providerGuard) return providerGuard;

  const snippet = await prisma.knowledgeSnippet.findFirst({
    where: {
      id: snippetId,
      enabled: true,
      source: {
        enabled: true,
        status: { in: ["ready", "enabled"] },
        knowledgeBase: { enabled: true },
      },
      version: { status: "ready" },
    },
    include: { searchMetadata: true },
  });

  if (!snippet) {
    return {
      status: "failed",
      reason: "snippet-unavailable",
      evidence: { profileId: profile.id, snippetId },
    };
  }

  const embeddingInput = snippet.searchMetadata?.lexicalText ?? snippet.content;
  const contentHash = snippet.searchMetadata?.contentHash ?? hashText(snippet.content);
  const embedding = await provider.embed({
    input: embeddingInput,
    model: profile.embeddingModel,
    dimensions: profile.embeddingDimensions,
  });

  const embeddingGuard = validateEmbeddingResultForProfile(profile, embedding, snippetId);
  if (embeddingGuard) return embeddingGuard;

  const vectorLiteral = toVectorLiteral(embedding.vector);
  const embeddingId = randomUUID();
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "KnowledgeEmbedding" (
      "id",
      "snippetId",
      "profileId",
      "model",
      "dimensions",
      "contentHash",
      "status",
      "vectorRef",
      "embedding",
      "generatedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${embeddingId},
      ${snippet.id},
      ${profile.id},
      ${profile.embeddingModel},
      ${profile.embeddingDimensions},
      ${contentHash},
      'ready',
      ${`pgvector:${profile.id}:${contentHash}`},
      ${vectorLiteral}::public.vector,
      now(),
      now(),
      now()
    )
    ON CONFLICT ("snippetId", "profileId")
    DO UPDATE SET
      "model" = EXCLUDED."model",
      "dimensions" = EXCLUDED."dimensions",
      "contentHash" = EXCLUDED."contentHash",
      "status" = 'ready',
      "vectorRef" = EXCLUDED."vectorRef",
      "embedding" = EXCLUDED."embedding",
      "errorCode" = NULL,
      "generatedAt" = now(),
      "updatedAt" = now()
    RETURNING "id"
  `;

  return {
    status: "ready",
    embeddingId: rows[0].id,
    snippetId: snippet.id,
    profileId: profile.id,
    model: profile.embeddingModel,
    dimensions: profile.embeddingDimensions,
    contentHash,
    provider: embedding.provider,
  };
}

export async function retrieveVectorCandidates(
  query: string,
  options: {
    knowledgeBaseIds?: string[];
    limit?: number;
    provider?: EmbeddingProvider;
  } = {}
): Promise<VectorRetrievalResult> {
  const provider = options.provider ?? createDeterministicTestEmbeddingProvider();
  const profileResult = await getReadyActiveSearchIndexProfile();
  if (profileResult.status === "failed") return { ...profileResult, vectorHits: [] };
  const profile = profileResult.profile;
  const providerGuard = validateProviderForProfile(profile, provider);
  if (providerGuard) return { ...providerGuard, vectorHits: [] };

  const queryEmbedding = await provider.embed({
    input: query,
    model: profile.embeddingModel,
    dimensions: profile.embeddingDimensions,
  });

  const queryEmbeddingGuard = validateEmbeddingResultForProfile(profile, queryEmbedding);
  if (queryEmbeddingGuard) return { ...queryEmbeddingGuard, vectorHits: [] };

  const limit = Math.min(Math.max(options.limit ?? DEFAULT_VECTOR_LIMIT, 1), MAX_VECTOR_LIMIT);
  const knowledgeBaseIds = normalizeKnowledgeBaseIds(options.knowledgeBaseIds);
  const vectorLiteral = toVectorLiteral(queryEmbedding.vector);
  const rows =
    knowledgeBaseIds.length > 0
      ? await prisma.$queryRaw<VectorCandidateRow[]>`
          SELECT
            e."id" AS "embeddingId",
            e."snippetId",
            e."profileId",
            e."model",
            e."dimensions",
            s."sourceId",
            source."title" AS "sourceTitle",
            s."sourcePath",
            s."section",
            (e."embedding" OPERATOR(public.<->) ${vectorLiteral}::public.vector)::double precision AS "distance"
          FROM "KnowledgeEmbedding" e
          JOIN "KnowledgeSnippet" s ON s."id" = e."snippetId"
          JOIN "KnowledgeSource" source ON source."id" = s."sourceId"
          JOIN "KnowledgeSourceVersion" version ON version."id" = s."versionId"
          JOIN "KnowledgeBase" kb ON kb."id" = source."knowledgeBaseId"
          WHERE e."profileId" = ${profile.id}
            AND e."status" = 'ready'
            AND e."dimensions" = ${profile.embeddingDimensions}
            AND public.vector_dims(e."embedding") = ${profile.embeddingDimensions}
            AND e."model" = ${profile.embeddingModel}
            AND e."embedding" IS NOT NULL
            AND s."enabled" = true
            AND source."enabled" = true
            AND source."status" IN ('ready', 'enabled')
            AND version."status" = 'ready'
            AND kb."enabled" = true
            AND kb."id" IN (${Prisma.join(knowledgeBaseIds)})
          ORDER BY e."embedding" OPERATOR(public.<->) ${vectorLiteral}::public.vector
          LIMIT ${limit}
        `
      : await prisma.$queryRaw<VectorCandidateRow[]>`
          SELECT
            e."id" AS "embeddingId",
            e."snippetId",
            e."profileId",
            e."model",
            e."dimensions",
            s."sourceId",
            source."title" AS "sourceTitle",
            s."sourcePath",
            s."section",
            (e."embedding" OPERATOR(public.<->) ${vectorLiteral}::public.vector)::double precision AS "distance"
          FROM "KnowledgeEmbedding" e
          JOIN "KnowledgeSnippet" s ON s."id" = e."snippetId"
          JOIN "KnowledgeSource" source ON source."id" = s."sourceId"
          JOIN "KnowledgeSourceVersion" version ON version."id" = s."versionId"
          JOIN "KnowledgeBase" kb ON kb."id" = source."knowledgeBaseId"
          WHERE e."profileId" = ${profile.id}
            AND e."status" = 'ready'
            AND e."dimensions" = ${profile.embeddingDimensions}
            AND public.vector_dims(e."embedding") = ${profile.embeddingDimensions}
            AND e."model" = ${profile.embeddingModel}
            AND e."embedding" IS NOT NULL
            AND s."enabled" = true
            AND source."enabled" = true
            AND source."status" IN ('ready', 'enabled')
            AND version."status" = 'ready'
            AND kb."enabled" = true
          ORDER BY e."embedding" OPERATOR(public.<->) ${vectorLiteral}::public.vector
          LIMIT ${limit}
        `;

  return {
    status: "ready",
    query,
    profileId: profile.id,
    provider: queryEmbedding.provider,
    model: profile.embeddingModel,
    dimensions: profile.embeddingDimensions,
    candidatesReturned: rows.length,
    vectorHits: rows.map((row, index) => ({
      snippetId: row.snippetId,
      embeddingId: row.embeddingId,
      profileId: row.profileId,
      sourceId: `kb-${row.sourceId}`,
      sourceTitle: row.sourceTitle,
      path: row.sourcePath,
      section: row.section ?? undefined,
      rank: index + 1,
      distance: row.distance,
      score: 1 / (1 + row.distance),
      model: row.model,
      dimensions: row.dimensions,
    })),
  };
}

async function getReadyActiveSearchIndexProfile(): Promise<
  | { status: "ready"; profile: ActiveSearchIndexProfile }
  | { status: "failed"; reason: EmbeddingFailureReason; evidence: EmbeddingFailureEvidence }
> {
  const profiles = await prisma.searchIndexProfile.findMany({
    where: { isActive: true },
    include: { embeddingProviderConfig: true },
    orderBy: { updatedAt: "desc" },
    take: 2,
  });
  const profile = profiles[0];
  if (!profile) {
    return { status: "failed", reason: "active-profile-missing", evidence: {} };
  }
  if (profiles.length > 1) {
    return {
      status: "failed",
      reason: "active-profile-ambiguous",
      evidence: {
        profileId: profile.id,
        profileStatus: profile.status,
        profileIsActive: profile.isActive,
        expectedDimensions: profile.embeddingDimensions,
        provider: profile.embeddingProvider,
        model: profile.embeddingModel,
      },
    };
  }
  if (profile.status !== "active") {
    return {
      status: "failed",
      reason: "active-profile-not-ready",
      evidence: {
        profileId: profile.id,
        profileStatus: profile.status,
        profileIsActive: profile.isActive,
        expectedDimensions: profile.embeddingDimensions,
        provider: profile.embeddingProvider,
        model: profile.embeddingModel,
      },
    };
  }
  return { status: "ready", profile };
}

function validateProviderForProfile(
  profile: ActiveSearchIndexProfile,
  provider: EmbeddingProvider
): Extract<EmbeddingGenerationResult, { status: "failed" }> | undefined {
  if (profile.embeddingProvider !== provider.name) {
    return {
      status: "failed",
      reason: "provider-unavailable",
      evidence: {
        profileId: profile.id,
        provider: profile.embeddingProvider,
        model: profile.embeddingModel,
        expectedDimensions: profile.embeddingDimensions,
      },
    };
  }

  if (profile.embeddingProvider === DETERMINISTIC_TEST_PROVIDER) return undefined;

  if (!profile.embeddingProviderConfig) {
    return {
      status: "failed",
      reason: "provider-config-unavailable",
      evidence: { profileId: profile.id, provider: profile.embeddingProvider, model: profile.embeddingModel },
    };
  }

  if (!profile.embeddingProviderConfig.enabled) {
    return {
      status: "failed",
      reason: "provider-disabled",
      evidence: { profileId: profile.id, provider: profile.embeddingProvider, model: profile.embeddingModel },
    };
  }

  if (
    profile.embeddingProviderConfig.provider !== profile.embeddingProvider ||
    profile.embeddingProviderConfig.model !== profile.embeddingModel ||
    profile.embeddingProviderConfig.dimensions !== profile.embeddingDimensions
  ) {
    return {
      status: "failed",
      reason: "dimensions-mismatch",
      evidence: {
        profileId: profile.id,
        expectedDimensions: profile.embeddingDimensions,
        actualDimensions: profile.embeddingProviderConfig.dimensions,
        provider: profile.embeddingProvider,
        model: profile.embeddingModel,
      },
    };
  }

  return undefined;
}

function validateEmbeddingResultForProfile(
  profile: ActiveSearchIndexProfile,
  embedding: EmbeddingProviderResult,
  snippetId?: string
): Extract<EmbeddingGenerationResult, { status: "failed" }> | undefined {
  if (embedding.provider !== profile.embeddingProvider || embedding.model !== profile.embeddingModel) {
    return {
      status: "failed",
      reason: "provider-output-mismatch",
      evidence: {
        profileId: profile.id,
        expectedDimensions: profile.embeddingDimensions,
        actualDimensions: embedding.dimensions,
        provider: embedding.provider,
        model: embedding.model,
        snippetId,
      },
    };
  }
  if (embedding.dimensions !== profile.embeddingDimensions || embedding.vector.length !== profile.embeddingDimensions) {
    return {
      status: "failed",
      reason: "dimensions-mismatch",
      evidence: {
        profileId: profile.id,
        expectedDimensions: profile.embeddingDimensions,
        actualDimensions: embedding.vector.length,
        provider: embedding.provider,
        model: embedding.model,
        snippetId,
      },
    };
  }
  return undefined;
}

type VectorCandidateRow = {
  embeddingId: string;
  snippetId: string;
  profileId: string;
  model: string;
  dimensions: number;
  sourceId: string;
  sourceTitle: string;
  sourcePath: string;
  section: string | null;
  distance: number;
};

function deterministicVector(input: string, dimensions: number): number[] {
  const seed = Buffer.from(createHash("sha256").update(input).digest());
  const values = Array.from({ length: dimensions }, (_, index) => {
    const byte = seed[index % seed.length];
    return byte / 255;
  });
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  return values.map((value) => Number((value / (magnitude || 1)).toFixed(6)));
}

function hashText(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function toVectorLiteral(vector: number[]): string {
  return `[${vector.map((value) => {
    if (!Number.isFinite(value)) throw new Error("Embedding vector contains a non-finite value.");
    return Number(value.toFixed(6));
  }).join(",")}]`;
}

function normalizeKnowledgeBaseIds(ids: string[] | undefined): string[] {
  return Array.from(new Set((ids ?? []).map((id) => id.trim()).filter(Boolean)));
}
