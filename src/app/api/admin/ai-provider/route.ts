import { adminAuthErrorResponse, requireAdmin } from "@/lib/admin-auth";
import {
  AiProviderConfigValidationError,
  getProviderConfigView,
  upsertProviderConfig,
} from "@/lib/ai/provider-config";

export async function GET() {
  try {
    await requireAdmin();
    const config = await getProviderConfigView();
    return Response.json({ config });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("AI provider config GET error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await parseJsonBody(request);
    const config = await upsertProviderConfig({
      baseUrl: readString(body, "baseUrl"),
      model: readString(body, "model"),
      apiKey: readOptionalString(body, "apiKey"),
      keepExistingApiKey: readBoolean(body, "keepExistingApiKey"),
      clearApiKey: readBoolean(body, "clearApiKey"),
      noKeyMode: readBoolean(body, "noKeyMode"),
      enabled: readBoolean(body, "enabled", true),
      updatedById: session.user.id,
    });

    return Response.json({ config });
  } catch (error) {
    const authResponse = adminAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof AiProviderConfigValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("AI provider config PUT error:", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    throw new AiProviderConfigValidationError("请求 JSON 格式不正确");
  }
}

function readString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value : "";
}

function readOptionalString(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  return typeof value === "string" ? value : undefined;
}

function readBoolean(body: Record<string, unknown>, key: string, defaultValue = false): boolean {
  const value = body[key];
  return typeof value === "boolean" ? value : defaultValue;
}
