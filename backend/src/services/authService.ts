import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, type IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";

export function signToken(user: IUser) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function publicUser(user: IUser) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department ?? null,
  };
}

export async function register(input: { name: string; email: string; password: string }) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.badRequest("An account with this email already exists.");

  // The very first account created becomes the administrator.
  const isFirstUser = (await User.estimatedDocumentCount()) === 0;

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    role: isFirstUser ? "admin" : "student",
  });

  return { user, token: signToken(user) };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Incorrect email or password.");
  }
  return { user, token: signToken(user) };
}

export async function updateProfile(user: IUser, input: { name?: string; department?: string }) {
  if (input.name) user.name = input.name;
  if (input.department !== undefined) user.department = input.department;
  await user.save();
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("Account not found.");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Your current password is incorrect.");
  }
  user.password = newPassword;
  await user.save();
}
