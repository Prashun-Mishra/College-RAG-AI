import type { Request, Response } from "express";
import * as feedbackService from "../services/feedbackService";
import { asyncHandler } from "../utils/asyncHandler";

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const feedback = await feedbackService.submitFeedback({
    userId: String(req.user!._id),
    messageId: req.body.messageId,
    rating: req.body.rating,
    reason: req.body.reason,
    comment: req.body.comment,
  });
  res.status(201).json({ feedback });
});

export const listFeedback = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ feedback: await feedbackService.listFeedback() });
});
