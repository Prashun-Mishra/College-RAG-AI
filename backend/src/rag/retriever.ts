import { env } from "../config/env";
import { DocumentChunk } from "../models/DocumentChunk";
import { embedText } from "./embeddings";
import { queryVectors } from "./vectorStore";

export interface RetrievedChunk {
  vectorId: string;
  documentId: string;
  documentName: string;
  page: number;
  category?: string;
  department?: string;
  content: string;
  score: number;
  matchType: "semantic" | "keyword";
}

export interface RetrievalFilters {
  category?: string;
  department?: string;
  year?: number;
}

function toFilter(filters?: RetrievalFilters) {
  const filter: Record<string, unknown> = {};
  if (filters?.category) filter.category = filters.category;
  if (filters?.department) filter.department = filters.department;
  if (filters?.year) filter.year = filters.year;
  return filter;
}

async function semanticSearch(question: string, filters?: RetrievalFilters): Promise<RetrievedChunk[]> {
  const vector = await embedText(question);
  const matches = await queryVectors(vector, env.topK, toFilter(filters));
  if (!matches.length) return [];

  const chunks = await DocumentChunk.find({ vectorId: { $in: matches.map((m) => m.id) } }).lean();
  const byVectorId = new Map(chunks.map((c) => [c.vectorId, c]));

  return matches
    .map((match) => {
      const chunk = byVectorId.get(match.id);
      if (!chunk) return null;
      return {
        vectorId: match.id,
        documentId: String(chunk.documentId),
        documentName: chunk.documentName,
        page: chunk.pageNumber,
        category: chunk.category,
        department: chunk.department,
        content: chunk.content,
        score: match.score,
        matchType: "semantic" as const,
      };
    })
    .filter(Boolean) as RetrievedChunk[];
}

/** Keyword half of hybrid search — catches notice numbers, codes, exact dates. */
async function keywordSearch(question: string, filters?: RetrievalFilters): Promise<RetrievedChunk[]> {
  const query: Record<string, unknown> = { $text: { $search: question } };
  if (filters?.category) query.category = filters.category;
  if (filters?.department) query.department = filters.department;
  if (filters?.year) query.year = filters.year;

  const chunks = await DocumentChunk.find(query, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(Math.max(3, Math.floor(env.topK / 2)))
    .lean();

  return chunks.map((chunk) => ({
    vectorId: chunk.vectorId,
    documentId: String(chunk.documentId),
    documentName: chunk.documentName,
    page: chunk.pageNumber,
    category: chunk.category,
    department: chunk.department,
    content: chunk.content,
    score: Math.min(1, ((chunk as any).score ?? 1) / 10),
    matchType: "keyword" as const,
  }));
}

/** Vector search, optionally fused with keyword search (reciprocal-rank fusion). */
export async function retrieve(question: string, filters?: RetrievalFilters): Promise<RetrievedChunk[]> {
  const semantic = await semanticSearch(question, filters);
  if (!env.hybridSearchEnabled) return semantic;

  const keyword = await keywordSearch(question, filters).catch(() => [] as RetrievedChunk[]);
  const fused = new Map<string, RetrievedChunk & { rrf: number }>();

  const add = (list: RetrievedChunk[]) =>
    list.forEach((chunk, rank) => {
      const existing = fused.get(chunk.vectorId);
      const rrf = 1 / (60 + rank + 1);
      if (existing) {
        existing.rrf += rrf;
        existing.score = Math.max(existing.score, chunk.score);
      } else {
        fused.set(chunk.vectorId, { ...chunk, rrf });
      }
    });

  add(semantic);
  add(keyword);

  return [...fused.values()].sort((a, b) => b.rrf - a.rrf).map(({ rrf: _rrf, ...chunk }) => chunk);
}
