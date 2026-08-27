import type { Request, Response } from "express";
import * as chatService from "../services/chatService";
import { buildRagContext, streamGroundedAnswer, NO_ANSWER_MESSAGE } from "../services/ragService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/** POST /api/chat — grounded answer, optionally streamed via SSE. */
export const ask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const userId = String(req.user._id);
  const question: string = req.body.question;
  const stream = req.body.stream !== false;

  const conversation = await chatService.assertConversation(userId, req.body.conversationId);
  const conversationId = String(conversation._id);

  await chatService.saveUserMessage(userId, conversationId, question);
  await chatService.maybeSetTitle(conversationId, question);

  const history = await chatService.recentHistory(conversationId);
  const context = await buildRagContext(question, {
    category: req.body.category,
    department: req.body.department,
  });

  const retrieval = {
    chunksRetrieved: context.chunksRetrieved,
    chunksUsed: context.used.length,
    confidence: context.confidence,
    averageScore: context.averageScore,
  };

  const persist = (answer: string) =>
    chatService.saveAssistantMessage({
      userId,
      conversationId,
      content: answer,
      sources: context.hasContext ? context.sources : [],
      chunksRetrieved: context.chunksRetrieved,
      chunksUsed: context.used.length,
      averageScore: context.averageScore,
      answered: context.hasContext,
    });

  if (!stream) {
    let answer = "";
    for await (const token of streamGroundedAnswer(question, context, history.slice(0, -1))) answer += token;
    answer = answer.trim() || NO_ANSWER_MESSAGE;
    const message = await persist(answer);
    res.json({
      conversationId,
      messageId: String(message._id),
      answer,
      sources: context.hasContext ? context.sources : [],
      retrieval,
    });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (event: string, data: unknown) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  send("meta", { conversationId, sources: context.hasContext ? context.sources : [], retrieval });

  let answer = "";
  let aborted = false;
  req.on("close", () => {
    aborted = true;
  });

  try {
    for await (const token of streamGroundedAnswer(question, context, history.slice(0, -1))) {
      if (aborted) break;
      answer += token;
      send("token", { token });
    }
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "The AI service is temporarily unavailable. Please try again.";
    send("error", { message });
    if (!answer) answer = message;
  }

  const saved = await persist(answer.trim() || NO_ANSWER_MESSAGE);
  send("done", { messageId: String(saved._id), conversationId });
  res.end();
});

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await chatService.listConversations(
    String(req.user!._id),
    req.query.search as string | undefined
  );
  res.json({ conversations });
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await chatService.createConversation(String(req.user!._id), req.body.title);
  res.status(201).json({ conversation });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  res.json(await chatService.getConversation(String(req.user!._id), req.params.id));
});

export const renameConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await chatService.renameConversation(
    String(req.user!._id),
    req.params.id,
    req.body.title
  );
  res.json({ conversation });
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  await chatService.deleteConversation(String(req.user!._id), req.params.id);
  res.json({ success: true });
});
