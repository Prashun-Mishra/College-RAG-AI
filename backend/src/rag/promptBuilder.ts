import type { RetrievedChunk } from "./retriever";

export const NO_ANSWER_MESSAGE =
  "I couldn't find this information in the college documents currently available to me.";

export const SYSTEM_PROMPT = `You are CollegeRAG AI, the official information assistant for a college.

Rules you must always follow:
- Answer ONLY using the CONTEXT sections provided below.
- Never invent or guess college-specific information: dates, fees, policies, contacts, eligibility or rules.
- If the context does not contain the answer, reply exactly: "${NO_ANSWER_MESSAGE}"
- Do not answer questions unrelated to the college using general knowledge; use the same fallback sentence.
- Keep answers concise, factual and useful. Use short paragraphs or bullet points.
- State uncertainty plainly when the context is partial.
- Cite the document name and page number inline, e.g. (Academic Calendar 2026-27, page 4).`;

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] Document: ${chunk.documentName} | Page: ${chunk.page} | Category: ${
          chunk.category ?? "General"
        }\n${chunk.content}`
    )
    .join("\n\n---\n\n");
}

export function buildUserPrompt(
  question: string,
  chunks: RetrievedChunk[],
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const historyBlock = history.length
    ? `PREVIOUS TURNS (for pronoun resolution only, never as a source of facts):\n${history
        .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
        .join("\n")}\n\n`
    : "";

  return `${historyBlock}CONTEXT:\n${buildContext(chunks)}\n\nSTUDENT QUESTION: ${question}\n\nAnswer using only the context above.`;
}
