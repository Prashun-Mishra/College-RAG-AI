import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== "admin") return next(ApiError.forbidden("This area is restricted to administrators."));
  next();
}
