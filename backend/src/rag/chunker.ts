import { env } from "../config/env";
import { cleanText } from "./textCleaner";
import type { ExtractedPage } from "./textExtractor";

export interface RawChunk {
  chunkIndex: number;
  pageNumber: number;
  content: string;
}

function splitWithOverlap(text: string, size: number, overlap: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+|\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length <= size) {
      current = `${current} ${sentence}`.trim();
      continue;
    }
    if (current) chunks.push(current);
    current = current.length > overlap ? `${current.slice(-overlap)} ${sentence}`.trim() : sentence;
    while (current.length > size) {
      chunks.push(current.slice(0, size));
      current = current.slice(size - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Splits each page into overlapping chunks; size/overlap are env-configurable. */
export function chunkPages(pages: ExtractedPage[]): RawChunk[] {
  const size = env.chunkSize;
  const overlap = Math.min(env.chunkOverlap, Math.floor(size / 2));
  const chunks: RawChunk[] = [];
  let index = 0;

  for (const page of pages) {
    const cleaned = cleanText(page.text);
    if (cleaned.length < 30) continue;
    for (const content of splitWithOverlap(cleaned, size, overlap)) {
      chunks.push({ chunkIndex: index++, pageNumber: page.pageNumber, content });
    }
  }
  return chunks;
}
