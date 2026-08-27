import { API_URL, ApiRequestError, authHeaders } from "@/lib/api";
import type { Retrieval, Source } from "@/lib/types";

export interface StreamHandlers {
  onMeta?: (data: { conversationId: string; sources: Source[]; retrieval: Retrieval }) => void;
  onToken?: (token: string) => void;
  onError?: (message: string) => void;
  onDone?: (data: { messageId: string; conversationId: string }) => void;
}

/** Consumes the backend SSE stream for POST /api/chat. */
export async function streamAnswer(
  body: { question: string; conversationId?: string; category?: string },
  handlers: StreamHandlers,
  signal?: AbortSignal
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!response.ok || !response.body) {
    let message = "The AI service is temporarily unavailable. Please try again.";
    try {
      const data = await response.json();
      message = data?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiRequestError(response.status, message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const eventLine = frame.split("\n").find((l) => l.startsWith("event: "));
      const dataLine = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!eventLine || !dataLine) continue;

      const event = eventLine.slice(7).trim();
      const data = JSON.parse(dataLine.slice(6));

      if (event === "meta") handlers.onMeta?.(data);
      else if (event === "token") handlers.onToken?.(data.token);
      else if (event === "error") handlers.onError?.(data.message);
      else if (event === "done") handlers.onDone?.(data);
    }
  }
}
