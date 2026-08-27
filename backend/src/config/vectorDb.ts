import { Pinecone, type Index } from "@pinecone-database/pinecone";
import { env } from "./env";

let client: Pinecone | null = null;
let index: Index | null = null;

export function isVectorDbConfigured() {
  return Boolean(env.pineconeApiKey && env.pineconeIndex);
}

export function getPineconeIndex(): Index {
  if (!isVectorDbConfigured()) {
    throw new Error("Vector database is not configured. Set PINECONE_API_KEY and PINECONE_INDEX.");
  }
  if (!client) client = new Pinecone({ apiKey: env.pineconeApiKey });
  if (!index) index = client.index(env.pineconeIndex);
  return index;
}

export function getNamespace() {
  return getPineconeIndex().namespace(env.pineconeNamespace);
}
