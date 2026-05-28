import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { listAdminKnowledgeSources } from "@/lib/knowledge/admin-view";
import {
  CLEAR_KNOWLEDGE_CONFIRMATION,
  DELETE_SELECTED_SOURCES_CONFIRMATION,
  KnowledgeCleanupValidationError,
  clearKnowledgeSources,
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
    const sourceIds = Array.isArray(body.sourceIds) ? readSourceIds(body) : null;
    readConfirmation(body, sourceIds ? DELETE_SELECTED_SOURCES_CONFIRMATION : CLEAR_KNOWLEDGE_CONFIRMATION);
    const result = sourceIds ? await deleteSelectedKnowledgeSources(sourceIds) : await clearKnowledgeSources();
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
