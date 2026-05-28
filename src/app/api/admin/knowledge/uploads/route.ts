import { createHash } from "node:crypto";
import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseValidationError, resolveKnowledgeBaseForUpload } from "@/lib/knowledge/bases";
import { writePrivateKnowledgeFile } from "@/lib/knowledge/private-storage";
import { KnowledgeUploadValidationError, validateKnowledgeUpload } from "@/lib/knowledge/upload-validation";

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const files = [...formData.getAll("file"), ...formData.getAll("files")].filter((value): value is File => value instanceof File);
    if (files.length === 0) {
      return Response.json({ error: "未提供文件" }, { status: 400 });
    }
    const knowledgeBase = await resolveKnowledgeBaseForUpload(formData, session.user.id);
    const preparedFiles = await Promise.all(files.map(prepareUploadedFile));
    const sources = [];
    for (const prepared of preparedFiles) {
      sources.push(await createUploadedSource(prepared, knowledgeBase, session.user.id));
    }

    return Response.json(
      {
        source: sources[0],
        sources,
      },
      { status: 201 }
    );
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeUploadValidationError || error instanceof KnowledgeBaseValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge upload error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

type UploadKnowledgeBase = Awaited<ReturnType<typeof resolveKnowledgeBaseForUpload>>;
type PreparedUpload = {
  file: File;
  buffer: Buffer;
  validated: ReturnType<typeof validateKnowledgeUpload>;
  contentHash: string;
};

async function prepareUploadedFile(file: File): Promise<PreparedUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const validated = validateKnowledgeUpload(file, buffer);
  return {
    file,
    buffer,
    validated,
    contentHash: createHash("sha256").update(buffer).digest("hex"),
  };
}

async function createUploadedSource(prepared: PreparedUpload, knowledgeBase: UploadKnowledgeBase, userId: string) {
  const { buffer, file, validated, contentHash } = prepared;
  const storageKey = await writePrivateKnowledgeFile(buffer, validated.extension);
  const source = await prisma.knowledgeSource.create({
    data: {
      knowledgeBaseId: knowledgeBase.id,
      title: validated.safeFilename,
      status: "uploaded",
      enabled: false,
      createdById: userId,
      versions: {
        create: {
          version: 1,
          originalFilename: validated.safeFilename,
          storageKey,
          mimeType: file.type || "application/octet-stream",
          fileSize: buffer.length,
          contentHash,
          importType: validated.kind,
          status: "uploaded",
          createdById: userId,
        },
      },
    },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = source.versions[0];

  return {
    id: source.id,
    knowledgeBase: {
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      slug: knowledgeBase.slug,
    },
    title: source.title,
    status: source.status,
    enabled: source.enabled,
    version: version.version,
    importType: version.importType,
    fileSize: version.fileSize,
    contentHash: version.contentHash,
    zipEntryCount: validated.zipEntryCount ?? null,
    createdAt: source.createdAt.toISOString(),
  };
}
