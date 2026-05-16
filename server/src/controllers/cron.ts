import type { Request, Response } from "express";
import { env } from "../config/env.ts";
import { runRankChecks } from "../cron/rankTracking.ts";

/** HTTP trigger for schedulers (Vercel Cron sends `Authorization: Bearer $CRON_SECRET`). */
export async function rankCheck(req: Request, res: Response) {
    if (!env.cronSecret) return res.status(503).json({ success: false, message: "CRON_SECRET is not configured" });
    if (req.headers.authorization !== `Bearer ${env.cronSecret}`) return res.status(401).json({ success: false, message: "Not authorized" });
    const summary = await runRankChecks();
    res.json({ success: true, ...summary });
}
