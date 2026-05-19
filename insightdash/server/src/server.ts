import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] cloud analysis: ${env.useCloudAnalysis ? "ENABLED" : "local"}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `[server] port ${env.port} is already in use. Stop the existing process or change PORT in server/.env before restarting.`
      );
      process.exit(1);
    }
    throw error;
  });
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});