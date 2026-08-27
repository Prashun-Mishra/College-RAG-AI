import type { Request, Response } from "express";
import * as analyticsService from "../services/analyticsService";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await analyticsService.getDashboard());
});

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 14;
  res.json(await analyticsService.getAnalytics(Number.isFinite(days) ? days : 14));
});
