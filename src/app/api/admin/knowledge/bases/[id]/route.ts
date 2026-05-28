import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import {
  KnowledgeBaseValidationError,
  readKnowledgeBaseUpdateInput,
  updateKnowledgeBase,
} from "@/lib/knowledge/bases";
import { KnowledgeAdminValidationError, parseJsonBody } from "@/lib/knowledge/admin-view";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await parseJsonBody(request);
    const input = readKnowledgeBaseUpdateInput(body);
    const knowledgeBase = await updateKnowledgeBase(id, input);
    if (!knowledgeBase) {
      return Response.json({ error: "知识库不存在" }, { status: 404 });
    }

    return Response.json({
      knowledgeBase: {
        id: knowledgeBase.id,
        name: knowledgeBase.name,
        slug: knowledgeBase.slug,
        description: knowledgeBase.description,
        enabled: knowledgeBase.enabled,
        updatedAt: knowledgeBase.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError || error instanceof KnowledgeBaseValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge base PATCH error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
