import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { listAdminKnowledgeSources } from "@/lib/knowledge/admin-view";
import {
  DELETE_SELECTED_SOURCES_CONFIRMATION,
  KnowledgeCleanupValidationError,
  deleteSelectedKnowledgeSources,
  readConfirmation,
  readSourceIds,
} from "@/lib/knowledge/cleanup";
import { KnowledgeAdminValidationError, parseJsonBody } from "@/lib/knowledge/admin-view";

export async function GET() {
  try {
    await requireAdmin();
    const sources = await listAdminKnowledgeSources();
    return Response.json({ sources });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Knowledge sources GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody(request);
    if (!Array.isArray(body.sourceIds)) {
      throw new KnowledgeCleanupValidationError("请选择要删除的知识来源");
    }
    const sourceIds = readSourceIds(body);
    readConfirmation(body, DELETE_SELECTED_SOURCES_CONFIRMATION);
    const result = await deleteSelectedKnowledgeSources(sourceIds);
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
    console.error("Knowledge sources DELETE error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
