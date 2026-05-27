import { describe, expect, it } from "vitest";
import {
  AiProviderConfigValidationError,
  normalizeProviderConfigInput,
  validateEndpointKeyMode,
} from "./provider-config";

describe("provider config validation", () => {
  it("normalizes endpoint and model", () => {
    expect(
      normalizeProviderConfigInput({
        baseUrl: "https://api.example.test///",
        model: " model-x ",
        noKeyMode: false,
        enabled: true,
      })
    ).toMatchObject({ baseUrl: "https://api.example.test", model: "model-x" });
  });

  it("requires api key for cloud endpoints", () => {
    expect(() => validateEndpointKeyMode("https://api.example.test", false, null)).toThrow(
      AiProviderConfigValidationError
    );
  });

  it("restricts no-key mode to localhost endpoints", () => {
    expect(() => validateEndpointKeyMode("https://api.example.test", true, null)).toThrow(
      AiProviderConfigValidationError
    );
    expect(() => validateEndpointKeyMode("http://localhost:1234/v1", true, null)).not.toThrow();
    expect(() => validateEndpointKeyMode("http://127.0.0.1:11434/v1", true, null)).not.toThrow();
  });
});
