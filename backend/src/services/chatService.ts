import { Types } from "mongoose";
import { Conversation } from "../models/Conversation";
import { Message, type IMessageSource } from "../models/Message";
import { ApiError } from "../utils/ApiError";

const HISTORY_TURNS = 6;

export async function listConversations(userId: string, search?: string) {
  const query: Record<string, unknown> = { userId };
  if (search) query.title = { $regex: search, $options: "i" };
  return Conversation.find(query).sort({ lastMessageAt: -1 }).lean();
}

export async function createConversation(userId: string, title = "New conversation") {
  return Conversation.create({ userId: new Types.ObjectId(userId), title });
}

export async function getConversation(userId: string, conversationId: string) {
  const conversation = await Conversation.findOne({ _id: conversationId, userId }).lean();
  if (!conversation) throw ApiError.notFound("Conversation not found.");
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  return { conversation, messages };
}

export async function renameConversation(userId: string, conversationId: string, title: string) {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, userId },
    { title },
    { new: true }
  );
  if (!conversation) throw ApiError.notFound("Conversation not found.");
  return conversation;
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });
  if (!conversation) throw ApiError.notFound("Conversation not found.");
  await Message.deleteMany({ conversationId });
}

export async function assertConversation(userId: string, conversationId?: string) {
  if (!conversationId) return createConversation(userId);
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) throw ApiError.notFound("Conversation not found.");
  return conversation;
}

/** Recent turns of THIS conversation only, so old chats can't contaminate retrieval. */
export async function recentHistory(conversationId: string) {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_TURNS)
    .lean();
  return messages
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 800) }));
}

export async function saveUserMessage(userId: string, conversationId: string, content: string) {
  return Message.create({ conversationId, userId, role: "user", content });
}

export async function saveAssistantMessage(input: {
  userId: string;
  conversationId: string;
  content: string;
  sources: IMessageSource[];
  chunksRetrieved: number;
  chunksUsed: number;
  averageScore: number;
  answered: boolean;
}) {
  const message = await Message.create({
    conversationId: input.conversationId,
    userId: input.userId,
    role: "assistant",
    content: input.content,
    sources: input.sources,
    chunksRetrieved: input.chunksRetrieved,
    chunksUsed: input.chunksUsed,
    averageScore: input.averageScore,
    answered: input.answered,
  });
  await Conversation.findByIdAndUpdate(input.conversationId, { lastMessageAt: new Date() });
  return message;
}

export function deriveTitle(question: string) {
  const clean = question.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}...` : clean || "New conversation";
}

export async function maybeSetTitle(conversationId: string, question: string) {
  const conversation = await Conversation.findById(conversationId);
  if (conversation && conversation.title === "New conversation") {
    conversation.title = deriveTitle(question);
    await conversation.save();
  }
}
