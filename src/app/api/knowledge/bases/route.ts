import { AuthError, requireAuth } from "@/lib/auth-helper";
import { listEnabledKnowledgeBases } from "@/lib/knowledge/bases";

export async function GET() {
  try {
    await requireAuth();
    const knowledgeBases = await listEnabledKnowledgeBases();
    return Response.json({ knowledgeBases });
  } catch (error) {
    if (error instanceof AuthError || (error instanceof Error && error.message === "未登录")) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }
    console.error("Knowledge bases GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
