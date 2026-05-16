import "dotenv/config";

const required = ["JWT_SECRET", "MONGODB_URI", "BROWSERBASE_API_KEY", "GEMINI_API_KEY"] as const;

const missing = required.filter((k) => !process.env[k] || process.env[k]!.startsWith("_"));
if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
}

export const env = {
    jwtSecret: process.env.JWT_SECRET!,
    mongoUri: process.env.MONGODB_URI!,
    browserbaseKey: process.env.BROWSERBASE_API_KEY!,
    geminiKey: process.env.GEMINI_API_KEY!,
    geminiModel: process.env.GEMINI_MODEL ?? "gemma-4-31b-it",
    /** Shared secret for the HTTP cron trigger. Vercel sets it as a bearer token. */
    cronSecret: process.env.CRON_SECRET ?? "",
    port: Number(process.env.PORT ?? 5050),
    isVercel: Boolean(process.env.VERCEL),
    corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;

export const FREE_DAILY_LIMIT = 5;
