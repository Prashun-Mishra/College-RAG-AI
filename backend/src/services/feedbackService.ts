import { Feedback } from "../models/Feedback";
import { Message } from "../models/Message";
import { ApiError } from "../utils/ApiError";

export async function submitFeedback(input: {
  userId: string;
  messageId: string;
  rating: "up" | "down";
  reason?: string;
  comment?: string;
}) {
  const message = await Message.findById(input.messageId);
  if (!message) throw ApiError.notFound("The answer you are rating no longer exists.");

  return Feedback.findOneAndUpdate(
    { userId: input.userId, messageId: input.messageId },
    { rating: input.rating, reason: input.reason ?? null, comment: input.comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function listFeedback(limit = 100) {
  return Feedback.find().sort({ createdAt: -1 }).limit(limit).populate("userId", "name email").lean();
}
