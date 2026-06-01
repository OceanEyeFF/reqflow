import { describe, expect, it } from "vitest";
import {
  ACTIVE_LEXICAL_ENGINE,
  LEXICAL_ENGINE_IDS,
  LEXICAL_ENGINE_READINESS,
  TARGET_BM25_LEXICAL_ENGINE,
  isRuntimeClaimAllowed,
} from "./lexical-engines";

describe("lexical engine readiness", () => {
  it("keeps native PostgreSQL FTS fallback as the active runtime engine", () => {
    expect(ACTIVE_LEXICAL_ENGINE).toMatchObject({
      id: "postgres-native-fts-fallback",
      bm25: false,
      currentDefault: true,
      requiresPgSearch: false,
      runtimeClaimAllowed: true,
      readinessStatus: "active",
    });
  });

  it("keeps pg_search BM25 as a target engine until runtime readiness is proven", () => {
    expect(TARGET_BM25_LEXICAL_ENGINE).toMatchObject({
      id: "pg-search-bm25",
      bm25: true,
      currentDefault: false,
      requiresPgSearch: true,
      runtimeClaimAllowed: false,
      readinessStatus: "target-runtime-required",
      fallbackEngineId: "postgres-native-fts-fallback",
    });
    expect(isRuntimeClaimAllowed(LEXICAL_ENGINE_IDS.pgSearchBm25)).toBe(false);
  });

  it("has exactly one current default lexical engine", () => {
    const defaults = Object.values(LEXICAL_ENGINE_READINESS).filter((engine) => engine.currentDefault);

    expect(defaults).toEqual([ACTIVE_LEXICAL_ENGINE]);
  });
});
