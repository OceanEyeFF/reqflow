import { prisma } from "@/lib/prisma";
import type { DeepseekConfig } from "./deepseek-provider";

const DEFAULT_CONFIG_NAME = "default";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
const LOCAL_HOST_PATTERN = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i;

export type AiProviderConfigView = {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  noKeyMode: boolean;
  enabled: boolean;
  hasApiKey: boolean;
  maskedApiKey: string | null;
  updatedAt: string;
};

export type AiProviderConfigInput = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  keepExistingApiKey?: boolean;
  clearApiKey?: boolean;
  noKeyMode: boolean;
  enabled: boolean;
  updatedById?: string;
};

export class AiProviderConfigValidationError extends Error {}

export async function getProviderConfigView(): Promise<AiProviderConfigView | null> {
  const config = await prisma.aiProviderConfig.findUnique({ where: { name: DEFAULT_CONFIG_NAME } });
  return config ? toConfigView(config) : null;
}

export async function upsertProviderConfig(input: AiProviderConfigInput): Promise<AiProviderConfigView> {
  const normalized = normalizeProviderConfigInput(input);
  const existing = await prisma.aiProviderConfig.findUnique({ where: { name: DEFAULT_CONFIG_NAME } });
  const apiKey = resolveApiKey({
    existingApiKey: existing?.apiKey ?? null,
    inputApiKey: input.apiKey,
    clearApiKey: input.clearApiKey,
    keepExistingApiKey: input.keepExistingApiKey,
    noKeyMode: normalized.noKeyMode,
  });
  validateEndpointKeyMode(normalized.baseUrl, normalized.noKeyMode, apiKey);

  const config = await prisma.aiProviderConfig.upsert({
    where: { name: DEFAULT_CONFIG_NAME },
    create: {
      name: DEFAULT_CONFIG_NAME,
      baseUrl: normalized.baseUrl,
      model: normalized.model,
      apiKey,
      noKeyMode: normalized.noKeyMode,
      enabled: normalized.enabled,
      updatedById: input.updatedById,
    },
    update: {
      baseUrl: normalized.baseUrl,
      model: normalized.model,
      apiKey,
      noKeyMode: normalized.noKeyMode,
      enabled: normalized.enabled,
      updatedById: input.updatedById,
    },
  });

  return toConfigView(config);
}

export async function getEffectiveProviderConfig(env: NodeJS.ProcessEnv = process.env): Promise<DeepseekConfig> {
  const configured = await prisma.aiProviderConfig.findUnique({ where: { name: DEFAULT_CONFIG_NAME } });
  if (!configured || !configured.enabled) {
    return {
      apiKey: env.DEEPSEEK_API_KEY,
      baseUrl: env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL,
      model: env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      timeoutMs: Number(env.DEEPSEEK_TIMEOUT_MS || 20000),
    };
  }

  return {
    apiKey: configured.noKeyMode ? undefined : configured.apiKey || undefined,
    baseUrl: configured.baseUrl,
    model: configured.model,
    timeoutMs: Number(env.DEEPSEEK_TIMEOUT_MS || 20000),
  };
}

export function normalizeProviderConfigInput(input: AiProviderConfigInput): AiProviderConfigInput {
  const baseUrl = input.baseUrl.trim().replace(/\/+$/, "");
  const model = input.model.trim();
  if (!baseUrl) throw new AiProviderConfigValidationError("API endpoint 不能为空");
  if (!model) throw new AiProviderConfigValidationError("模型不能为空");
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new AiProviderConfigValidationError("API endpoint 必须使用 http 或 https");
    }
  } catch (error) {
    if (error instanceof AiProviderConfigValidationError) throw error;
    throw new AiProviderConfigValidationError("API endpoint 格式不正确");
  }

  return { ...input, baseUrl, model };
}

export function validateEndpointKeyMode(baseUrl: string, noKeyMode: boolean, apiKey: string | null): void {
  if (noKeyMode && !LOCAL_HOST_PATTERN.test(baseUrl)) {
    throw new AiProviderConfigValidationError("无 API key 模式仅允许 localhost 或 127.0.0.1 endpoint");
  }
  if (!noKeyMode && !apiKey) {
    throw new AiProviderConfigValidationError("云端 Provider 必须配置 API key");
  }
}

function resolveApiKey({
  existingApiKey,
  inputApiKey,
  clearApiKey,
  keepExistingApiKey,
  noKeyMode,
}: {
  existingApiKey: string | null;
  inputApiKey?: string;
  clearApiKey?: boolean;
  keepExistingApiKey?: boolean;
  noKeyMode: boolean;
}): string | null {
  if (noKeyMode || clearApiKey) return null;
  const trimmed = inputApiKey?.trim();
  if (trimmed) return trimmed;
  if (keepExistingApiKey) return existingApiKey;
  return existingApiKey;
}

function toConfigView(config: {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string | null;
  noKeyMode: boolean;
  enabled: boolean;
  updatedAt: Date;
}): AiProviderConfigView {
  return {
    id: config.id,
    name: config.name,
    baseUrl: config.baseUrl,
    model: config.model,
    noKeyMode: config.noKeyMode,
    enabled: config.enabled,
    hasApiKey: Boolean(config.apiKey),
    maskedApiKey: config.apiKey ? maskApiKey(config.apiKey) : null,
    updatedAt: config.updatedAt.toISOString(),
  };
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "********";
  return `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`;
}
