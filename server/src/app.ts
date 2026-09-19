import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { connectDB } from "./config/db.ts";
import { errorHandler, notFound } from "./middleware/errors.ts";
import { authRouter } from "./routes/auth.ts";
import { analysisRouter } from "./routes/analysis.ts";
import { rankRouter } from "./routes/rank.ts";
import { cronRouter } from "./routes/cron.ts";

export const app = express();

app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "100kb" }));

// Serverless-safe: make sure the DB is up before any handler runs.
app.use((_req, _res, next) => {
    connectDB().then(() => next(), next);
});

app.get("/", (_req, res) => res.json({ ok: true, service: "posiq-api" }));
app.use("/api/auth", authRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/rank", rankRouter);
app.use("/api/cron", cronRouter);

app.use(notFound);
app.use(errorHandler);
