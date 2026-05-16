import cron from "node-cron";
import { KeywordTracking } from "../models/KeywordTracking.ts";
import { keywordTracking } from "../services/keywordTracking.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Check every active keyword, spaced out to avoid rate limiting. */
export async function runRankChecks() {
    const active = await KeywordTracking.find({ active: true });
    let ok = 0;
    for (const tracking of active) {
        tracking.status = "checking";
        await tracking.save();
        const result = await keywordTracking(tracking);
        if (result.success) ok += 1;
        await sleep(10_000 + Math.random() * 5000);
    }
    console.log(`[cron] rank checks done: ${ok}/${active.length} succeeded`);
    return { total: active.length, ok };
}

/** In-process schedule for long-running hosts. On Vercel use the HTTP trigger instead. */
export function startRankTrackingCron() {
    cron.schedule("0 6 * * *", () => {
        console.log("[cron] starting daily rank tracking");
        runRankChecks().catch((err) => console.error("[cron] failed:", (err as Error).message));
    });
    console.log("[cron] rank tracking scheduled for 06:00 daily");
}
