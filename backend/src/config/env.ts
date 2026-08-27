import dotenv from "dotenv";
dotenv.config();

const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const bool = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value === "true" || value === "1";

export const env = {
  port: num(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",

  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/collegerag",

  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  aiProvider: (process.env.AI_PROVIDER ?? "gemini") as "gemini" | "openrouter",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiChatModel: process.env.GEMINI_CHAT_MODEL ?? "gemini-2.0-flash",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openrouterChatModel: process.env.OPENROUTER_CHAT_MODEL ?? "google/gemini-2.0-flash-001",

  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-004",
  embeddingDimensions: num(process.env.EMBEDDING_DIMENSIONS, 768),

  pineconeApiKey: process.env.PINECONE_API_KEY ?? "",
  pineconeIndex: process.env.PINECONE_INDEX ?? "collegerag",
  pineconeNamespace: process.env.PINECONE_NAMESPACE ?? "default",

  chunkSize: num(process.env.CHUNK_SIZE, 1000),
  chunkOverlap: num(process.env.CHUNK_OVERLAP, 150),
  topK: num(process.env.TOP_K, 8),
  rerankEnabled: bool(process.env.RERANK_ENABLED, true),
  rerankTopN: num(process.env.RERANK_TOP_N, 4),
  hybridSearchEnabled: bool(process.env.HYBRID_SEARCH_ENABLED, true),
  minRelevanceScore: num(process.env.MIN_RELEVANCE_SCORE, 0.3),

  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  maxUploadMb: num(process.env.MAX_UPLOAD_MB, 25),
};

export function assertRequiredEnv() {
  const missing: string[] = [];
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.mongoUri) missing.push("MONGODB_URI");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
