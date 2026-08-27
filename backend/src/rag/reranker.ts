import { env } from "../config/env";
import type { RetrievedChunk } from "./retriever";

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","of","for","to","in","on","at","and","or","what","when",
  "where","who","how","my","our","this","that","it","do","does","can","i","about","tell","me",
]);

function terms(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Lightweight lexical-overlap reranker applied after vector retrieval:
 * Top-K chunks -> reranker -> top-N chunks sent to the LLM.
 */
export function rerank(question: string, chunks: RetrievedChunk[]): RetrievedChunk[] {
  if (!env.rerankEnabled || chunks.length <= env.rerankTopN) {
    return chunks.slice(0, env.rerankTopN);
  }

  const queryTerms = terms(question);
  const scored = chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();
    const hits = queryTerms.filter((term) => content.includes(term)).length;
    const overlap = queryTerms.length ? hits / queryTerms.length : 0;
    return { chunk, combined: chunk.score * 0.7 + overlap * 0.3 };
  });

  return scored
    .sort((a, b) => b.combined - a.combined)
    .slice(0, env.rerankTopN)
    .map((s) => s.chunk);
}
