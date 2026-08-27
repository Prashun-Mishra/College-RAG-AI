import { env } from "../config/env";
import { NO_ANSWER_MESSAGE, SYSTEM_PROMPT, buildUserPrompt } from "../rag/promptBuilder";
import { rerank } from "../rag/reranker";
import { retrieve, type RetrievalFilters, type RetrievedChunk } from "../rag/retriever";
import { streamCompletion } from "./llmService";

export interface AnswerSource {
  documentId: string;
  documentName: string;
  page: number;
  snippet: string;
  category?: string;
  score: number;
}

export interface RagContext {
  chunksRetrieved: number;
  used: RetrievedChunk[];
  sources: AnswerSource[];
  averageScore: number;
  confidence: "high" | "medium" | "low";
  hasContext: boolean;
}

function toSource(chunk: RetrievedChunk): AnswerSource {
  return {
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    page: chunk.page,
    snippet: chunk.content.slice(0, 320).trim(),
    category: chunk.category,
    score: Number(chunk.score.toFixed(3)),
  };
}

/** Retrieval + optional reranking; returns the grounded context for the LLM. */
export async function buildRagContext(
  question: string,
  filters?: RetrievalFilters
): Promise<RagContext> {
  const retrieved = await retrieve(question, filters);
  const relevant = retrieved.filter((c) => c.score >= env.minRelevanceScore);
  const used = rerank(question, relevant.length ? relevant : retrieved.slice(0, 0));

  const averageScore = used.length ? used.reduce((sum, c) => sum + c.score, 0) / used.length : 0;
  const confidence = averageScore >= 0.75 ? "high" : averageScore >= 0.5 ? "medium" : "low";

  return {
    chunksRetrieved: retrieved.length,
    used,
    sources: used.map(toSource),
    averageScore: Number(averageScore.toFixed(3)),
    confidence,
    hasContext: used.length > 0,
  };
}

/** Streams a grounded answer; refuses instead of hallucinating when no context. */
export async function* streamGroundedAnswer(
  question: string,
  context: RagContext,
  history: { role: "user" | "assistant"; content: string }[] = []
): AsyncGenerator<string> {
  if (!context.hasContext) {
    yield NO_ANSWER_MESSAGE;
    return;
  }
  yield* streamCompletion(SYSTEM_PROMPT, buildUserPrompt(question, context.used, history));
}

export { NO_ANSWER_MESSAGE };
