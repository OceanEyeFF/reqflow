import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import { listAdminKnowledgeSources } from "@/lib/knowledge/admin-view";

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
