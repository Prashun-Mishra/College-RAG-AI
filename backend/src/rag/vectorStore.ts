import { getNamespace, isVectorDbConfigured } from "../config/vectorDb";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

function assertConfigured() {
  if (!isVectorDbConfigured()) {
    throw ApiError.serviceUnavailable("Knowledge search is temporarily unavailable.", "vector_db_not_configured");
  }
}

export async function upsertVectors(records: VectorRecord[], batchSize = 100) {
  assertConfigured();
  const ns = getNamespace();
  for (let i = 0; i < records.length; i += batchSize) {
    await ns.upsert(records.slice(i, i + batchSize));
  }
}

export async function queryVectors(
  vector: number[],
  topK = env.topK,
  filter?: Record<string, unknown>
): Promise<VectorMatch[]> {
  assertConfigured();
  const response = await getNamespace().query({
    vector,
    topK,
    includeMetadata: true,
    ...(filter && Object.keys(filter).length ? { filter } : {}),
  });
  return (response.matches ?? []).map((m) => ({
    id: m.id,
    score: m.score ?? 0,
    metadata: (m.metadata ?? {}) as Record<string, any>,
  }));
}

export async function deleteVectorsByIds(ids: string[]) {
  if (!ids.length || !isVectorDbConfigured()) return;
  await getNamespace().deleteMany(ids);
}
