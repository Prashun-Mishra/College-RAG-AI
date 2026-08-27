import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("This endpoint does not exist."));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isApiError = error instanceof ApiError;
  const status = isApiError ? error.status : 500;
  const message = isApiError ? error.message : "Something went wrong on our side. Please try again.";
  const code = isApiError ? error.code : "internal_error";

  if (!isApiError || status >= 500) {
    console.error("[error]", error);
  }

  res.status(status).json({
    error: { message, code, ...(isApiError && error.details ? { details: error.details } : {}) },
    ...(env.nodeEnv === "development" && !isApiError ? { hint: String(error) } : {}),
  });
}
