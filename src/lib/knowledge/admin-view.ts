import { prisma } from "@/lib/prisma";

export type AdminKnowledgeSourceView = Awaited<ReturnType<typeof listAdminKnowledgeSources>>[number];

export async function listAdminKnowledgeSources() {
  const sources = await prisma.knowledgeSource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      knowledgeBase: true,
      _count: { select: { snippets: true, versions: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 3,
        include: {
          _count: { select: { snippets: true } },
        },
      },
      snippets: {
        orderBy: [{ createdAt: "desc" }, { chunkIndex: "asc" }],
        take: 5,
        select: {
          id: true,
          sourcePath: true,
          section: true,
          content: true,
          chunkIndex: true,
          enabled: true,
          createdAt: true,
        },
      },
    },
  });

  return sources.map((source) => ({
    id: source.id,
    knowledgeBase: {
      id: source.knowledgeBase.id,
      name: source.knowledgeBase.name,
      slug: source.knowledgeBase.slug,
      enabled: source.knowledgeBase.enabled,
    },
    title: source.title,
    status: source.status,
    enabled: source.enabled,
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString(),
    snippetCount: source._count.snippets,
    versionCount: source._count.versions,
    versions: source.versions.map((version) => ({
      id: version.id,
      version: version.version,
      originalFilename: version.originalFilename,
      mimeType: version.mimeType,
      fileSize: version.fileSize,
      contentHash: version.contentHash,
      importType: version.importType,
      status: version.status,
      errorCode: version.errorCode,
      createdAt: version.createdAt.toISOString(),
      snippetCount: version._count.snippets,
    })),
    snippets: source.snippets.map((snippet) => ({
      id: snippet.id,
      sourcePath: snippet.sourcePath,
      section: snippet.section,
      snippet: snippet.content,
      chunkIndex: snippet.chunkIndex,
      enabled: snippet.enabled,
      createdAt: snippet.createdAt.toISOString(),
    })),
  }));
}

export class KnowledgeAdminValidationError extends Error {}

export function readEnabledFlag(body: Record<string, unknown>): boolean {
  if (typeof body.enabled !== "boolean") {
    throw new KnowledgeAdminValidationError("enabled 必须是布尔值");
  }
  return body.enabled;
}

export async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    throw new KnowledgeAdminValidationError("请求 JSON 格式不正确");
  }
}
