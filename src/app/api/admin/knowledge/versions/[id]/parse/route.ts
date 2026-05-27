import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { KnowledgeParseError, parseKnowledgeSourceVersion } from "@/lib/knowledge/parser";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await parseKnowledgeSourceVersion(id);
    return Response.json(result);
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof KnowledgeParseError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Knowledge parse error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
