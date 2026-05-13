import dotenv from "dotenv";
dotenv.config();

// Helper to strip inline comments from environment variables
const clean = (val: string | undefined): string | undefined => {
  if (!val) return val;
  // If there's a #, take everything before it and trim
  return val.split("#")[0].trim();
};

export const config = {
  port: Number(clean(process.env.PORT)) || 8080,
  nodeEnv: clean(process.env.NODE_ENV) || "development",
  db: {
    url: clean(process.env.DATABASE_URL)!,
  },
  jwt: {
    secret: clean(process.env.JWT_SECRET)!,
    expiresIn: clean(process.env.JWT_EXPIRES_IN) || "7d",
  },
  cors: {
    allowedOrigin: (() => {
      const val = clean(process.env.CORS_ORIGIN);
      if (!val) return [
        "http://localhost:3000",
        "https://blooddonors--erp-b2b69.us-east4.hosted.app"
      ];
      return val.includes(",") ? val.split(",").map(s => s.trim()) : val;
    })(),
  },
};




