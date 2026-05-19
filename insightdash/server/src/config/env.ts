import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || "5001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/insightdash"),
  jwtSecret: required("JWT_SECRET", "dev-only-change-me"),
  cookieName: process.env.COOKIE_NAME || "insightdash_token",
  useCloudAnalysis: (process.env.USE_CLOUD_ANALYSIS || "false") === "true",
  cloudAnalysisUrl: process.env.CLOUD_ANALYSIS_URL || "",
  cloudAnalysisToken: process.env.CLOUD_ANALYSIS_TOKEN || "",
};

export const isProd = env.nodeEnv === "production";