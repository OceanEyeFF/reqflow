import { prisma } from "@/lib/prisma";
import { deletePrivateKnowledgeFile } from "./private-storage";

export const DELETE_SOURCE_CONFIRMATION = "DELETE_SOURCE";
export const CLEAR_KNOWLEDGE_CONFIRMATION = "CLEAR_KNOWLEDGE";

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

export async function deleteKnowledgeSource(sourceId: string): Promise<KnowledgeCleanupResult | null> {
  const source = await prisma.knowledgeSource.findUnique({
    where: { id: sourceId },
    include: { versions: { select: { storageKey: true } } },
  });
  if (!source) return null;

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
    include: { versions: { select: { storageKey: true } } },
  });
  const storageKeys = sources.flatMap((source) => source.versions.map((version) => version.storageKey));
  await prisma.knowledgeSource.deleteMany();
  const storageCleanupErrors = await cleanupStorageKeys(storageKeys);

  return {
    deletedSourceCount: sources.length,
    deletedStorageKeys: storageKeys,
    storageCleanupErrors,
  };
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
