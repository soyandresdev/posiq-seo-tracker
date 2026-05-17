import type { KeywordTrackingDoc } from "../models/KeywordTracking.ts";
import { rankTracker } from "./rankTracker.ts";
import type { RankCheck, Result } from "../types/api.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run a rank check for one tracking and persist position, history and competitors. */
export async function keywordTracking(tracking: KeywordTrackingDoc): Promise<Result<RankCheck>> {
    try {
        const locale = { country: tracking.country, language: tracking.language };
        let result = await rankTracker(tracking.keyword, tracking.domain, locale);
        if (!result.success || result.data.totalResultsScanned === 0) {
            await sleep(result.success ? 3000 : 5000);
            result = await rankTracker(tracking.keyword, tracking.domain, locale);
        }

        if (!result.success) {
            tracking.status = "failed";
            await tracking.save();
            return result;
        }

        const { data } = result;
        const prev = tracking.currentPosition;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        tracking.currentPosition = data.position;
        tracking.currentPage = data.page;
        tracking.competitors = data.competitors as typeof tracking.competitors;
        tracking.lastChecked = new Date();
        tracking.status = "completed";
        tracking.positionChange = prev && data.position ? prev - data.position : 0;
        if (data.position && (!tracking.bestPosition || data.position < tracking.bestPosition)) tracking.bestPosition = data.position;

        const entry = { date: today, position: data.position, page: data.page, title: data.title, snippet: data.snippet };
        const idx = tracking.rankHistory.findIndex((h) => h.date.toDateString() === today.toDateString());
        if (idx >= 0) tracking.rankHistory[idx] = entry as (typeof tracking.rankHistory)[number];
        else tracking.rankHistory.push(entry);

        await tracking.save();
        return result;
    } catch (err) {
        const message = (err as Error).message;
        console.error("[rank] update failed:", message);
        tracking.status = "failed";
        await tracking.save().catch(() => undefined);
        return { success: false, error: message };
    }
}
