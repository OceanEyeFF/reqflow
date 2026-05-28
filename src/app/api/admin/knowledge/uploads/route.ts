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
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "未提供文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateKnowledgeUpload(file, buffer);
    const knowledgeBase = await resolveKnowledgeBaseForUpload(formData, session.user.id);
    const storageKey = await writePrivateKnowledgeFile(buffer, validated.extension);
    const contentHash = createHash("sha256").update(buffer).digest("hex");
    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId: knowledgeBase.id,
        title: validated.safeFilename,
        status: "uploaded",
        enabled: false,
        createdById: session.user.id,
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
            createdById: session.user.id,
          },
        },
      },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    const version = source.versions[0];

    return Response.json(
      {
        source: {
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
        },
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
