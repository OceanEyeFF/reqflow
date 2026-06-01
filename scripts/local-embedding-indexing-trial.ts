import {
  createTestDatabaseUrl,
  disconnectPrisma,
  pushTestDatabaseSchema,
  removeTestDatabase,
  seedUser,
} from "../src/test/api-test-helpers";

const baseUrl = process.env.LOCAL_EMBEDDING_BASE_URL ?? "http://127.0.0.1:8081";
const path = process.env.LOCAL_EMBEDDING_PATH ?? "/embed";
const requestFormat = normalizeRequestFormat(process.env.LOCAL_EMBEDDING_REQUEST_FORMAT ?? "tei");
const model = process.env.LOCAL_EMBEDDING_MODEL ?? "intfloat/multilingual-e5-large";
const dimensions = Number(process.env.LOCAL_EMBEDDING_DIMENSIONS ?? "1024");
const timeoutMs = Number(process.env.LOCAL_EMBEDDING_TIMEOUT_MS ?? "30000");

if (!Number.isInteger(dimensions) || dimensions <= 0) {
  throw new Error(`LOCAL_EMBEDDING_DIMENSIONS must be a positive integer. Received: ${process.env.LOCAL_EMBEDDING_DIMENSIONS}`);
}

const databaseUrl = createTestDatabaseUrl("local_embedding_indexing_trial");
process.env.DATABASE_URL = databaseUrl;
pushTestDatabaseSchema(databaseUrl);

let prismaRef: Awaited<typeof import("../src/lib/prisma")>["prisma"] | undefined;

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  try {
    const [{ prisma }, { createHttpEmbeddingProvider }, { generateKnowledgeSnippetEmbedding }, { retrieveHybridKnowledgeSnippets }] =
      await Promise.all([
        import("../src/lib/prisma"),
        import("../src/lib/knowledge/embedding-http-provider"),
        import("../src/lib/knowledge/embeddings"),
        import("../src/lib/knowledge/retrieval"),
      ]);
    prismaRef = prisma;

    const admin = await seedUser(prisma, { role: "admin" });
    const { knowledgeBaseId, sourceId, snippetId } = await seedReadySnippet(prisma, admin.id);
    const providerConfig = await prisma.embeddingProviderConfig.create({
      data: {
        name: "local-sidecar-trial",
        provider: "local-cpu-sidecar",
        model,
        dimensions,
        baseUrl,
        noKeyMode: true,
        enabled: true,
        updatedById: admin.id,
      },
    });
    const profile = await prisma.searchIndexProfile.create({
      data: {
        name: "local-sidecar-trial-profile",
        embeddingProviderConfigId: providerConfig.id,
        embeddingProvider: providerConfig.provider,
        embeddingModel: model,
        embeddingDimensions: dimensions,
        semanticSpace: `${model}:${dimensions}`,
        lexicalEngine: "postgres-native-fts-fallback",
        status: "active",
        isActive: true,
      },
    });
    const provider = createHttpEmbeddingProvider({
      name: providerConfig.provider,
      baseUrl,
      path,
      requestFormat,
      timeoutMs,
    });

    const generation = await generateKnowledgeSnippetEmbedding(snippetId, provider);
    if (generation.status !== "ready") {
      throw new Error(`Embedding generation failed: ${JSON.stringify(generation)}`);
    }

    const embeddingRows = await prisma.$queryRaw<Array<{ id: string; dimensions: number; vectorDimensions: number | null }>>`
      SELECT "id", "dimensions", public.vector_dims("embedding") AS "vectorDimensions"
      FROM "KnowledgeEmbedding"
      WHERE "snippetId" = ${snippetId} AND "profileId" = ${profile.id}
    `;
    if (embeddingRows.length !== 1 || embeddingRows[0].vectorDimensions !== dimensions) {
      throw new Error(`Expected one ${dimensions}-dimensional embedding row, received: ${JSON.stringify(embeddingRows)}`);
    }

    const hybrid = await retrieveHybridKnowledgeSnippets("一般耗材标准检验出库", {
      knowledgeBaseIds: [knowledgeBaseId],
      vectorProvider: provider,
    });
    if (hybrid.debugEvidence.vectorLane.status !== "ready" || hybrid.debugEvidence.vectorHits.length < 1) {
      throw new Error(`Hybrid vector lane was not ready: ${JSON.stringify(hybrid.debugEvidence.vectorLane)}`);
    }

    console.log(
      JSON.stringify(
        {
          status: "ready",
          endpoint: new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString(),
          requestFormat,
          provider: providerConfig.provider,
          model,
          dimensions,
          schema: new URL(databaseUrl).searchParams.get("schema"),
          profileId: profile.id,
          snippetId,
          sourceId: `kb-${sourceId}`,
          embedding: {
            id: embeddingRows[0].id,
            vectorDimensions: embeddingRows[0].vectorDimensions,
          },
          vectorLane: hybrid.debugEvidence.vectorLane,
          topFusedHit: hybrid.debugEvidence.fusedHits[0],
        },
        null,
        2
      )
    );
  } finally {
    await disconnectPrisma(prismaRef);
    removeTestDatabase(databaseUrl);
  }
}

function normalizeRequestFormat(value: string): "openai" | "tei" {
  if (value === "openai" || value === "tei") return value;
  throw new Error(`LOCAL_EMBEDDING_REQUEST_FORMAT must be "openai" or "tei". Received: ${value}`);
}

async function seedReadySnippet(
  prisma: Awaited<typeof import("../src/lib/prisma")>["prisma"],
  userId: string
): Promise<{ knowledgeBaseId: string; sourceId: string; snippetId: string }> {
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: "Local embedding trial",
      slug: `local-embedding-trial-${Date.now()}`,
      enabled: true,
      createdById: userId,
    },
  });
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: "一般耗材标准检验出库",
      status: "ready",
      enabled: true,
      createdById: userId,
    },
  });
  const version = await prisma.knowledgeSourceVersion.create({
    data: {
      sourceId: source.id,
      originalFilename: "consumables.md",
      storageKey: "trial/consumables.md",
      mimeType: "text/markdown",
      fileSize: 100,
      contentHash: `trial-${Date.now()}`,
      importType: "document",
      status: "ready",
      createdById: userId,
      snippets: {
        create: {
          sourceId: source.id,
          sourcePath: "docs/consumables.md",
          content: "一般耗材完成标准检验且结果合格后，才允许办理出库。",
          chunkIndex: 0,
          enabled: true,
        },
      },
    },
    include: { snippets: true },
  });
  const snippet = version.snippets[0];
  await prisma.knowledgeSnippetSearchMetadata.create({
    data: {
      snippetId: snippet.id,
      sourcePath: snippet.sourcePath,
      documentTitle: "一般耗材标准检验出库",
      lexicalText: "一般耗材 标准检验 检验合格 出库",
      contentHash: "trial-lexical-hash",
      domainEntities: ["一般耗材"],
      processNames: ["标准检验出库"],
      materialTypes: ["耗材"],
      approvalActions: ["检验合格"],
      applicabilityRules: ["合格后出库"],
    },
  });

  return { knowledgeBaseId: knowledgeBase.id, sourceId: source.id, snippetId: snippet.id };
}
