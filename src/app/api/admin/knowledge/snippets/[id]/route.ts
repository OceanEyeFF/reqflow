import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeAdminValidationError, parseJsonBody, readEnabledFlag } from "@/lib/knowledge/admin-view";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await parseJsonBody(request);
    const enabled = readEnabledFlag(body);
    const snippet = await prisma.knowledgeSnippet.findUnique({ where: { id } });
    if (!snippet) {
      return Response.json({ error: "知识片段不存在" }, { status: 404 });
    }

    const updated = await prisma.knowledgeSnippet.update({
      where: { id },
      data: { enabled },
    });

    return Response.json({
      snippet: {
        id: updated.id,
        sourcePath: updated.sourcePath,
        section: updated.section,
        chunkIndex: updated.chunkIndex,
        enabled: updated.enabled,
      },
    });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge snippet PATCH error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
