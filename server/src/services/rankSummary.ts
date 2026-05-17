import type { KeywordTrackingDoc } from "../models/KeywordTracking.ts";

const DAYS = 30;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** 0–100 weight for a position: #1 = 100, #2 = 80, #10 ≈ 13, not found = 0. Mirrors click-through decay. */
export const visibilityOf = (position: number | null | undefined) => (position ? 100 * Math.pow(0.8, position - 1) : 0);

export function buildSummary(trackings: KeywordTrackingDoc[]) {
    const active = trackings.filter((t) => t.active);
    const checked = trackings.filter((t) => t.lastChecked);

    // Daily series over the last 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const series: { date: string; visibility: number | null; avgPosition: number | null; tracked: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dayKey(d);
        const entries = trackings.flatMap((t) => t.rankHistory.filter((h) => dayKey(h.date) === key).slice(-1));
        const found = entries.filter((e) => e.position);
        series.push({
            date: key,
            visibility: entries.length ? Math.round((entries.reduce((s, e) => s + visibilityOf(e.position), 0) / entries.length) * 10) / 10 : null,
            avgPosition: found.length ? Math.round((found.reduce((s, e) => s + (e.position as number), 0) / found.length) * 10) / 10 : null,
            tracked: entries.length,
        });
    }
    const withData = series.filter((s) => s.visibility !== null);
    const visibility = checked.length ? Math.round((checked.reduce((s, t) => s + visibilityOf(t.currentPosition), 0) / checked.length) * 10) / 10 : 0;
    const weekAgo = series[DAYS - 8]?.visibility ?? withData[0]?.visibility ?? null;
    const visibilityChange = weekAgo === null ? null : Math.round((visibility - weekAgo) * 10) / 10;

    // Distribution of current positions
    const distribution = { top3: 0, top10: 0, top20: 0, top50: 0, notFound: 0, pending: 0 };
    for (const t of trackings) {
        const p = t.currentPosition;
        if (!t.lastChecked) distribution.pending += 1;
        else if (!p) distribution.notFound += 1;
        else if (p <= 3) distribution.top3 += 1;
        else if (p <= 10) distribution.top10 += 1;
        else if (p <= 20) distribution.top20 += 1;
        else distribution.top50 += 1;
    }

    // Movers since the previous check
    const mover = (t: KeywordTrackingDoc) => ({ id: t._id.toString(), keyword: t.keyword, country: t.country, position: t.currentPosition, change: t.positionChange });
    const moved = trackings.filter((t) => t.positionChange !== 0 && t.currentPosition);
    const up = moved.filter((t) => t.positionChange > 0).sort((a, b) => b.positionChange - a.positionChange).slice(0, 5).map(mover);
    const down = moved.filter((t) => t.positionChange < 0).sort((a, b) => a.positionChange - b.positionChange).slice(0, 5).map(mover);

    // Competitors: domains ranking above you, counted across keywords
    const comp = new Map<string, { domain: string; keywords: number; positions: number[] }>();
    for (const t of trackings) {
        const mine = t.currentPosition ?? 51;
        for (const c of t.competitors) {
            if (c.position >= mine) continue;
            const row = comp.get(c.domain) ?? { domain: c.domain, keywords: 0, positions: [] };
            row.keywords += 1;
            row.positions.push(c.position);
            comp.set(c.domain, row);
        }
    }
    const competitors = [...comp.values()]
        .map((c) => ({ domain: c.domain, keywords: c.keywords, avgPosition: Math.round((c.positions.reduce((s, p) => s + p, 0) / c.positions.length) * 10) / 10 }))
        .sort((a, b) => b.keywords - a.keywords || a.avgPosition - b.avgPosition)
        .slice(0, 8);

    // Check status
    const lastRun = checked.length ? new Date(Math.max(...checked.map((t) => +new Date(t.lastChecked as Date)))) : null;
    const next = new Date();
    next.setHours(6, 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);

    return {
        totals: { tracked: trackings.length, active: active.length, paused: trackings.length - active.length, checking: trackings.filter((t) => t.status === "checking").length, failed: trackings.filter((t) => t.status === "failed").length },
        visibility,
        visibilityChange,
        avgPosition: series[DAYS - 1]?.avgPosition ?? null,
        series,
        distribution,
        movers: { up, down },
        competitors,
        status: { lastRun, nextRun: next, okToday: checked.filter((t) => t.status === "completed" && t.lastChecked && dayKey(new Date(t.lastChecked)) === dayKey(today)).length, failedToday: trackings.filter((t) => t.status === "failed").length },
    };
}
