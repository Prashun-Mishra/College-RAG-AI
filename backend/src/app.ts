import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { uploadPath } from "./middleware/upload";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import documentRoutes from "./routes/documentRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const clean = origin.replace(/\/$/, "");
        if (
          env.clientUrls.includes(clean) ||
          env.clientUrls.includes("*") ||
          clean.endsWith(".vercel.app") ||
          clean.startsWith("http://localhost:")
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive callback to prevent blocking in cloud deployment
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.nodeEnv !== "test") app.use(morgan("dev"));

  app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use("/api/auth", rateLimit({ windowMs: 15 * 60_000, limit: 40, standardHeaders: true, legacyHeaders: false }));

  app.use("/uploads", express.static(path.resolve(uploadPath)));

  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", uptime: process.uptime(), environment: env.nodeEnv })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
