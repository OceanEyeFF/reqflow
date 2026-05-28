import { prisma } from "@/lib/prisma";
import { deletePrivateKnowledgeFile } from "./private-storage";

export const DELETE_SOURCE_CONFIRMATION = "DELETE_SOURCE";
export const CLEAR_KNOWLEDGE_CONFIRMATION = "CLEAR_KNOWLEDGE";
export const DELETE_SELECTED_SOURCES_CONFIRMATION = "DELETE_SELECTED_SOURCES";

export class KnowledgeCleanupValidationError extends Error {}

export type KnowledgeCleanupResult = {
  deletedSourceCount: number;
  deletedStorageKeys: string[];
  storageCleanupErrors: string[];
};

export function readConfirmation(body: Record<string, unknown>, expected: string): void {
  if (body.confirmation !== expected) {
    throw new KnowledgeCleanupValidationError("确认短语不正确");
  }
}

export function readSourceIds(body: Record<string, unknown>): string[] {
  if (!Array.isArray(body.sourceIds)) {
    throw new KnowledgeCleanupValidationError("sourceIds 必须是数组");
  }
  const sourceIds = Array.from(new Set(body.sourceIds));
  if (sourceIds.length === 0) {
    throw new KnowledgeCleanupValidationError("请选择要删除的知识来源");
  }
  if (!sourceIds.every((id) => typeof id === "string" && id.length > 0)) {
    throw new KnowledgeCleanupValidationError("sourceIds 必须是字符串数组");
  }
  return sourceIds as string[];
}

export async function deleteKnowledgeSource(sourceId: string): Promise<KnowledgeCleanupResult | null> {
  const source = await prisma.knowledgeSource.findUnique({
    where: { id: sourceId },
    include: {
      knowledgeBase: { select: { enabled: true } },
      versions: { select: { storageKey: true } },
    },
  });
  if (!source) return null;
  assertSourcesAreCleanupEligible([source]);

  const storageKeys = source.versions.map((version) => version.storageKey);
  await prisma.knowledgeSource.delete({ where: { id: sourceId } });
  const storageCleanupErrors = await cleanupStorageKeys(storageKeys);

  return {
    deletedSourceCount: 1,
    deletedStorageKeys: storageKeys,
    storageCleanupErrors,
  };
}

export async function clearKnowledgeSources(): Promise<KnowledgeCleanupResult> {
  const sources = await prisma.knowledgeSource.findMany({
    include: {
      knowledgeBase: { select: { enabled: true } },
      versions: { select: { storageKey: true } },
    },
  });
  assertSourcesAreCleanupEligible(sources);
  const storageKeys = sources.flatMap((source) => source.versions.map((version) => version.storageKey));
  await prisma.knowledgeSource.deleteMany();
  const storageCleanupErrors = await cleanupStorageKeys(storageKeys);

  return {
    deletedSourceCount: sources.length,
    deletedStorageKeys: storageKeys,
    storageCleanupErrors,
  };
}

export async function deleteSelectedKnowledgeSources(sourceIds: string[]): Promise<KnowledgeCleanupResult> {
  const sources = await prisma.knowledgeSource.findMany({
    where: { id: { in: sourceIds } },
    include: {
      knowledgeBase: { select: { enabled: true } },
      versions: { select: { storageKey: true } },
    },
  });
  if (sources.length !== sourceIds.length) {
    throw new KnowledgeCleanupValidationError("部分知识来源不存在");
  }
  assertSourcesAreCleanupEligible(sources);
  const storageKeys = Array.from(new Set(sources.flatMap((source) => source.versions.map((version) => version.storageKey))));
  await prisma.knowledgeSource.deleteMany({ where: { id: { in: sources.map((source) => source.id) } } });
  const storageCleanupErrors = await cleanupStorageKeys(storageKeys);

  return {
    deletedSourceCount: sources.length,
    deletedStorageKeys: storageKeys,
    storageCleanupErrors,
  };
}

function assertSourcesAreCleanupEligible(sources: Array<{ knowledgeBase: { enabled: boolean } }>): void {
  if (sources.some((source) => !source.knowledgeBase.enabled)) {
    throw new KnowledgeCleanupValidationError("禁用/归档知识库下的内容不可清理，请先恢复知识库");
  }
}

async function cleanupStorageKeys(storageKeys: string[]): Promise<string[]> {
  const errors: string[] = [];
  for (const storageKey of storageKeys) {
    try {
      await deletePrivateKnowledgeFile(storageKey);
    } catch {
      errors.push(storageKey);
    }
  }
  return errors;
}
