export const LEXICAL_ENGINE_IDS = {
  postgresNativeFtsFallback: "postgres-native-fts-fallback",
  pgSearchBm25: "pg-search-bm25",
} as const;

export type LexicalEngineId = (typeof LEXICAL_ENGINE_IDS)[keyof typeof LEXICAL_ENGINE_IDS];

export type LexicalEngineReadiness = {
  id: LexicalEngineId;
  label: string;
  bm25: boolean;
  currentDefault: boolean;
  requiresPgSearch: boolean;
  runtimeClaimAllowed: boolean;
  readinessStatus: "active" | "target-runtime-required";
  fallbackEngineId?: LexicalEngineId;
};

export const LEXICAL_ENGINE_READINESS: Record<LexicalEngineId, LexicalEngineReadiness> = {
  [LEXICAL_ENGINE_IDS.postgresNativeFtsFallback]: {
    id: LEXICAL_ENGINE_IDS.postgresNativeFtsFallback,
    label: "PostgreSQL native FTS fallback",
    bm25: false,
    currentDefault: true,
    requiresPgSearch: false,
    runtimeClaimAllowed: true,
    readinessStatus: "active",
  },
  [LEXICAL_ENGINE_IDS.pgSearchBm25]: {
    id: LEXICAL_ENGINE_IDS.pgSearchBm25,
    label: "pg_search BM25",
    bm25: true,
    currentDefault: false,
    requiresPgSearch: true,
    runtimeClaimAllowed: false,
    readinessStatus: "target-runtime-required",
    fallbackEngineId: LEXICAL_ENGINE_IDS.postgresNativeFtsFallback,
  },
};

export const ACTIVE_LEXICAL_ENGINE = LEXICAL_ENGINE_READINESS[LEXICAL_ENGINE_IDS.postgresNativeFtsFallback];
export const TARGET_BM25_LEXICAL_ENGINE = LEXICAL_ENGINE_READINESS[LEXICAL_ENGINE_IDS.pgSearchBm25];

export function isRuntimeClaimAllowed(engineId: LexicalEngineId): boolean {
  return LEXICAL_ENGINE_READINESS[engineId].runtimeClaimAllowed;
}
