import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const AI_DOWN = "The AI service is temporarily unavailable. Please try again.";

function geminiModel() {
  if (!env.geminiApiKey) throw ApiError.serviceUnavailable(AI_DOWN, "ai_not_configured");
  return new GoogleGenerativeAI(env.geminiApiKey).getGenerativeModel({
    model: env.geminiChatModel,
  });
}

async function* openrouterStream(system: string, prompt: string) {
  if (!env.openrouterApiKey) throw ApiError.serviceUnavailable(AI_DOWN, "ai_not_configured");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openrouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.openrouterChatModel,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok || !response.body) throw ApiError.serviceUnavailable(AI_DOWN, "ai_request_failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        /* ignore keep-alive fragments */
      }
    }
  }
}

/** Streams the grounded answer token-by-token from the configured provider. */
export async function* streamCompletion(system: string, prompt: string): AsyncGenerator<string> {
  try {
    if (env.aiProvider === "openrouter") {
      yield* openrouterStream(system, prompt);
      return;
    }
    const result = await geminiModel().generateContentStream({
      systemInstruction: { role: "system", parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("[llm]", error);
    throw ApiError.serviceUnavailable(AI_DOWN, "ai_request_failed");
  }
}

export async function complete(system: string, prompt: string): Promise<string> {
  let output = "";
  for await (const token of streamCompletion(system, prompt)) output += token;
  return output.trim();
}
