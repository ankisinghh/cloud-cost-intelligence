import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import datasetsRoutes from "./routes/datasets.routes";
import exportsRoutes from "./routes/exports.routes";
import awsRoutes from "./routes/aws.routes";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();
  const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://cloud-cost-intelligence.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/datasets", datasetsRoutes);
  app.use("/api/exports", exportsRoutes);
  app.use("/api/aws", awsRoutes);

  app.use(errorHandler);
  return app;
}