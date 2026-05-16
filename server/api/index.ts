// Vercel entry: the Express app as a serverless function. No in-process cron here;
// vercel.json schedules GET /api/cron/rank-check instead.
import { app } from "../src/app.ts";

export default app;
