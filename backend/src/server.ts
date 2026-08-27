import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { assertRequiredEnv, env } from "./config/env";

async function bootstrap() {
  assertRequiredEnv();
  await connectDatabase();
  createApp().listen(env.port, () => {
    console.log(`[server] CollegeRAG API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});
