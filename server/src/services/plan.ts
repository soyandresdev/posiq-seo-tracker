import { FREE_DAILY_LIMIT } from "../config/env.ts";
import type { UserDoc } from "../models/User.ts";

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Analyses used today. The stored counter resets lazily on a new day. */
export function analysesUsedToday(user: UserDoc) {
    if (!user.lastAnalysisDate || user.lastAnalysisDate < startOfToday()) return 0;
    return user.analysisCount;
}

/** Reserve one analysis for the user, or explain why they can't. */
export async function consumeAnalysis(user: UserDoc): Promise<{ ok: true } | { ok: false; message: string }> {
    if (user.plan === "free") {
        const used = analysesUsedToday(user);
        if (used >= FREE_DAILY_LIMIT) return { ok: false, message: `Daily limit of ${FREE_DAILY_LIMIT} analyses reached. Upgrade to Pro for unlimited audits.` };
        user.analysisCount = used + 1;
    } else {
        user.analysisCount = analysesUsedToday(user) + 1;
    }
    user.lastAnalysisDate = new Date();
    await user.save();
    return { ok: true };
}
