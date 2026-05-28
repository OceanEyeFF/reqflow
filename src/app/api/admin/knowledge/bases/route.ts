import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import {
  KnowledgeBaseValidationError,
  createKnowledgeBase,
  listAdminKnowledgeBases,
  readKnowledgeBaseInput,
} from "@/lib/knowledge/bases";
import { KnowledgeAdminValidationError, parseJsonBody } from "@/lib/knowledge/admin-view";

export async function GET() {
  try {
    await requireAdmin();
    const knowledgeBases = await listAdminKnowledgeBases();
    return Response.json({ knowledgeBases });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Knowledge bases GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await parseJsonBody(request);
    const input = readKnowledgeBaseInput(body);
    const knowledgeBase = await createKnowledgeBase(input, session.user.id);
    return Response.json(
      {
        knowledgeBase: {
          id: knowledgeBase.id,
          name: knowledgeBase.name,
          slug: knowledgeBase.slug,
          description: knowledgeBase.description,
          enabled: knowledgeBase.enabled,
          createdAt: knowledgeBase.createdAt.toISOString(),
          updatedAt: knowledgeBase.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeAdminValidationError || error instanceof KnowledgeBaseValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge bases POST error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
