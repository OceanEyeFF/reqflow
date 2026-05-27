import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeAdminValidationError, parseJsonBody, readEnabledFlag } from "@/lib/knowledge/admin-view";
import {
  DELETE_SOURCE_CONFIRMATION,
  KnowledgeCleanupValidationError,
  deleteKnowledgeSource,
  readConfirmation,
} from "@/lib/knowledge/cleanup";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await parseJsonBody(request);
    const enabled = readEnabledFlag(body);
    const source = await prisma.knowledgeSource.findUnique({ where: { id } });
    if (!source) {
      return Response.json({ error: "知识来源不存在" }, { status: 404 });
    }
    if (enabled && !["ready", "enabled"].includes(source.status)) {
      return Response.json({ error: "只能启用已解析成功的知识来源" }, { status: 400 });
    }

    const updated = await prisma.knowledgeSource.update({
      where: { id },
      data: { enabled, status: enabled ? "enabled" : source.status === "enabled" ? "ready" : source.status },
    });

    return Response.json({
      source: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        enabled: updated.enabled,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge source PATCH error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await parseJsonBody(request);
    readConfirmation(body, DELETE_SOURCE_CONFIRMATION);
    const result = await deleteKnowledgeSource(id);
    if (!result) {
      return Response.json({ error: "知识来源不存在" }, { status: 404 });
    }
    return Response.json({
      success: true,
      deletedCount: result.deletedSourceCount,
      storageCleanupErrors: result.storageCleanupErrors,
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError || error instanceof KnowledgeCleanupValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge source DELETE error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
