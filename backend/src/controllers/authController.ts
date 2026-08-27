import type { Request, Response } from "express";
import * as authService from "../services/authService";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

const isProduction = env.nodeEnv === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  secure: isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });
  res.cookie("token", token, cookieOptions);
  res.status(201).json({ user: authService.publicUser(user), token });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  res.cookie("token", token, cookieOptions);
  res.json({ user: authService.publicUser(user), token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ user: authService.publicUser(req.user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.updateProfile(req.user, {
    name: req.body.name,
    department: req.body.department,
  });
  res.json({ user: authService.publicUser(user) });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.changePassword(String(req.user._id), req.body.currentPassword, req.body.newPassword);
  res.json({ success: true });
});
