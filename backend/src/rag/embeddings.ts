import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

interface EmbedResponse {
  embedding: { values: number[] };
}

interface BatchEmbedResponse {
  embeddings: { values: number[] }[];
}

function assertConfigured() {
  if (!env.geminiApiKey) {
    throw ApiError.serviceUnavailable(
      "Knowledge search is temporarily unavailable.",
      "embeddings_not_configured"
    );
  }
}

/** Embeds one text (query or chunk) with the configured embedding model. */
export async function embedText(text: string): Promise<number[]> {
  assertConfigured();
  const url = `${API_BASE}/models/${env.embeddingModel}:embedContent?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${env.embeddingModel}`,
      content: { parts: [{ text }] },
      outputDimensionality: env.embeddingDimensions,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[embedText] API error:", response.status, errorText);
    throw new Error(`Embedding API error (${response.status}): ${errorText}`);
  }

  const data: EmbedResponse = await response.json();
  return data.embedding.values;
}

/** Embeds many chunks with light batching to stay inside provider limits. */
export async function embedTexts(texts: string[], batchSize = 20): Promise<number[][]> {
  assertConfigured();
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const url = `${API_BASE}/models/${env.embeddingModel}:batchEmbedContents?key=${env.geminiApiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${env.embeddingModel}`,
          content: { parts: [{ text }] },
          outputDimensionality: env.embeddingDimensions,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[embedTexts] API error:", response.status, errorText);
      throw new Error(`Embedding API error (${response.status}): ${errorText}`);
    }

    const data: BatchEmbedResponse = await response.json();
    vectors.push(...data.embeddings.map((e) => e.values));
  }

  return vectors;
}
