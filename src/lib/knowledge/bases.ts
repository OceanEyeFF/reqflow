import { prisma } from "@/lib/prisma";

export const DEFAULT_KNOWLEDGE_BASE_ID = "default";
export const DEFAULT_KNOWLEDGE_BASE_SLUG = "default";

export class KnowledgeBaseValidationError extends Error {}

export type KnowledgeBaseInput = {
  name: string;
  slug?: string;
  description?: string | null;
};

export async function ensureDefaultKnowledgeBase(createdById?: string | null) {
  return prisma.knowledgeBase.upsert({
    where: { slug: DEFAULT_KNOWLEDGE_BASE_SLUG },
    update: {},
    create: {
      id: DEFAULT_KNOWLEDGE_BASE_ID,
      name: "默认知识库",
      slug: DEFAULT_KNOWLEDGE_BASE_SLUG,
      description: "MS7 兼容默认知识库",
      createdById: createdById ?? undefined,
    },
  });
}

export async function resolveKnowledgeBaseForUpload(input: FormData, createdById: string) {
  const rawId = input.get("knowledgeBaseId");
  if (rawId == null || rawId === "") {
    return ensureDefaultKnowledgeBase(createdById);
  }
  if (typeof rawId !== "string") {
    throw new KnowledgeBaseValidationError("knowledgeBaseId 必须是字符串");
  }

  const knowledgeBase = await prisma.knowledgeBase.findUnique({ where: { id: rawId } });
  if (!knowledgeBase || !knowledgeBase.enabled) {
    throw new KnowledgeBaseValidationError("知识库不存在或已停用");
  }
  return knowledgeBase;
}

export async function listAdminKnowledgeBases() {
  const bases = await prisma.knowledgeBase.findMany({
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { sources: true } },
    },
  });

  return bases.map((base) => ({
    id: base.id,
    name: base.name,
    slug: base.slug,
    description: base.description,
    enabled: base.enabled,
    sourceCount: base._count.sources,
    createdAt: base.createdAt.toISOString(),
    updatedAt: base.updatedAt.toISOString(),
  }));
}

export async function createKnowledgeBase(input: KnowledgeBaseInput, createdById: string) {
  const name = normalizeName(input.name);
  const slug = normalizeSlug(input.slug ?? name);
  const description = normalizeDescription(input.description);

  try {
    return await prisma.knowledgeBase.create({
      data: {
        name,
        slug,
        description,
        createdById,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new KnowledgeBaseValidationError("知识库标识已存在");
    }
    throw error;
  }
}

export function readKnowledgeBaseInput(body: Record<string, unknown>): KnowledgeBaseInput {
  if (typeof body.name !== "string") {
    throw new KnowledgeBaseValidationError("知识库名称不能为空");
  }
  return {
    name: body.name,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    description: typeof body.description === "string" ? body.description : null,
  };
}

function normalizeName(name: string): string {
  const normalized = name.trim();
  if (normalized.length === 0 || normalized.length > 80) {
    throw new KnowledgeBaseValidationError("知识库名称长度必须为 1-80 个字符");
  }
  return normalized;
}

function normalizeSlug(slug: string): string {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  if (!/^[a-z0-9][a-z0-9_-]{1,59}$/.test(normalized)) {
    throw new KnowledgeBaseValidationError("知识库标识只能包含小写字母、数字、横线和下划线");
  }
  return normalized;
}

function normalizeDescription(description: string | null | undefined): string | null {
  const normalized = description?.trim();
  if (!normalized) return null;
  if (normalized.length > 200) {
    throw new KnowledgeBaseValidationError("知识库描述不能超过 200 个字符");
  }
  return normalized;
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
