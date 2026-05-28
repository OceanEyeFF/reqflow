import { prisma } from "@/lib/prisma";

export const DEFAULT_KNOWLEDGE_BASE_ID = "default";
export const DEFAULT_KNOWLEDGE_BASE_SLUG = "default";

export class KnowledgeBaseValidationError extends Error {}

export type KnowledgeBaseInput = {
  name: string;
  description?: string | null;
};

export type KnowledgeBaseUpdateInput = {
  name?: string;
  description?: string | null;
  enabled?: boolean;
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
  let knowledgeBase;
  if (rawId == null || rawId === "") {
    knowledgeBase = await ensureDefaultKnowledgeBase(createdById);
  } else if (typeof rawId !== "string") {
    throw new KnowledgeBaseValidationError("knowledgeBaseId 必须是字符串");
  } else {
    knowledgeBase = await prisma.knowledgeBase.findUnique({ where: { id: rawId } });
  }

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
    isDefault: isDefaultKnowledgeBase(base),
    sourceCount: base._count.sources,
    createdAt: base.createdAt.toISOString(),
    updatedAt: base.updatedAt.toISOString(),
  }));
}

export async function listEnabledKnowledgeBases() {
  const bases = await prisma.knowledgeBase.findMany({
    where: { enabled: true },
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { sources: true } },
    },
  });

  return bases.map((base) => ({
    id: base.id,
    name: base.name,
    slug: base.slug,
    description: base.description,
    sourceCount: base._count.sources,
  }));
}

export async function createKnowledgeBase(input: KnowledgeBaseInput, createdById: string) {
  const name = normalizeName(input.name);
  const description = normalizeDescription(input.description);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.knowledgeBase.create({
        data: {
          name,
          slug: generateKnowledgeBaseSlug(),
          description,
          createdById,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  throw new KnowledgeBaseValidationError("知识库标识生成失败，请重试");
}

export async function updateKnowledgeBase(id: string, input: KnowledgeBaseUpdateInput) {
  const current = await prisma.knowledgeBase.findUnique({ where: { id } });
  if (!current) return null;

  const data: {
    name?: string;
    description?: string | null;
    enabled?: boolean;
  } = {};
  if (input.name !== undefined) {
    data.name = normalizeName(input.name);
  }
  if (input.description !== undefined) {
    data.description = normalizeDescription(input.description);
  }
  if (input.enabled !== undefined) {
    if (typeof input.enabled !== "boolean") {
      throw new KnowledgeBaseValidationError("enabled 必须是布尔值");
    }
    if (!input.enabled && isDefaultKnowledgeBase(current)) {
      throw new KnowledgeBaseValidationError("默认知识库不可禁用");
    }
    data.enabled = input.enabled;
  }
  if (Object.keys(data).length === 0) {
    throw new KnowledgeBaseValidationError("没有可更新的知识库字段");
  }

  return prisma.knowledgeBase.update({ where: { id }, data });
}

export function readKnowledgeBaseUpdateInput(body: Record<string, unknown>): KnowledgeBaseUpdateInput {
  if ("slug" in body) {
    throw new KnowledgeBaseValidationError("知识库内部标识不可修改");
  }
  const input: KnowledgeBaseUpdateInput = {};
  if ("name" in body) {
    if (typeof body.name !== "string") {
      throw new KnowledgeBaseValidationError("知识库名称不能为空");
    }
    input.name = body.name;
  }
  if ("description" in body) {
    input.description = typeof body.description === "string" ? body.description : null;
  }
  if ("enabled" in body) {
    if (typeof body.enabled !== "boolean") {
      throw new KnowledgeBaseValidationError("enabled 必须是布尔值");
    }
    input.enabled = body.enabled;
  }
  return input;
}

export function readKnowledgeBaseInput(body: Record<string, unknown>): KnowledgeBaseInput {
  if ("slug" in body) {
    throw new KnowledgeBaseValidationError("知识库内部标识由系统生成，不可手动设置");
  }
  if (typeof body.name !== "string") {
    throw new KnowledgeBaseValidationError("知识库名称不能为空");
  }
  return {
    name: body.name,
    description: typeof body.description === "string" ? body.description : null,
  };
}

export function isDefaultKnowledgeBase(base: { id: string; slug: string }): boolean {
  return base.id === DEFAULT_KNOWLEDGE_BASE_ID || base.slug === DEFAULT_KNOWLEDGE_BASE_SLUG;
}

function normalizeName(name: string): string {
  const normalized = name.trim();
  if (normalized.length === 0 || normalized.length > 80) {
    throw new KnowledgeBaseValidationError("知识库名称长度必须为 1-80 个字符");
  }
  return normalized;
}

function generateKnowledgeBaseSlug(): string {
  return `kb_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
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
