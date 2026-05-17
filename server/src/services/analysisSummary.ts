import type { AnalysisDoc } from "../models/Analysis.ts";
import type { KeywordTrackingDoc } from "../models/KeywordTracking.ts";
import { buildSummary as buildRankSummary } from "./rankSummary.ts";

const DAYS = 30;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const host = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

export function buildAnalysisSummary(analyses: AnalysisDoc[], trackings: KeywordTrackingDoc[]) {
    const completed = analyses.filter((a) => a.status === "completed");
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    // Score per day, last 30 days (average of analyses completed that day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const series: { date: string; score: number | null; analyses: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dayKey(d);
        const dayItems = completed.filter((a) => dayKey(new Date(a.createdAt)) === key);
        series.push({ date: key, score: avg(dayItems.map((a) => a.overallScore)), analyses: dayItems.length });
    }

    // Category averages
    const categories = {
        seo: avg(completed.map((a) => a.categories?.seo ?? 0)) ?? 0,
        performance: avg(completed.map((a) => a.categories?.performance ?? 0)) ?? 0,
        accessibility: avg(completed.map((a) => a.categories?.accessibility ?? 0)) ?? 0,
        bestPractices: avg(completed.map((a) => a.categories?.bestPractices ?? 0)) ?? 0,
    };

    // Domains: latest score, previous score, count
    const byDomain = new Map<string, AnalysisDoc[]>();
    for (const a of [...completed].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt))) {
        const h = host(a.url);
        byDomain.set(h, [...(byDomain.get(h) ?? []), a]);
    }
    const domains = [...byDomain.entries()]
        .map(([domain, list]) => {
            const latest = list[0]!;
            const previous = list[1];
            return {
                domain,
                analyses: list.length,
                latestId: latest._id.toString(),
                latestScore: latest.overallScore,
                previousScore: previous?.overallScore ?? null,
                change: previous ? latest.overallScore - previous.overallScore : null,
                lastAnalyzed: latest.createdAt,
                openIssues: latest.issues.filter((i) => i.severity !== "info").length,
            };
        })
        .sort((a, b) => +new Date(b.lastAnalyzed) - +new Date(a.lastAnalyzed))
        .slice(0, 8);

    // Recurring problems: failed checks across the latest analysis of each domain
    const latestPerDomain = [...byDomain.values()].map((l) => l[0]!);
    const failed = new Map<string, { id: string; label: string; count: number }>();
    for (const a of latestPerDomain) for (const c of a.checks ?? []) if (!c.passed) failed.set(c.id, { id: c.id, label: c.label, count: (failed.get(c.id)?.count ?? 0) + 1 });
    const recurring = [...failed.values()].sort((a, b) => b.count - a.count).slice(0, 6);

    // Issues by severity across the latest analyses
    const severity = { critical: 0, warning: 0, info: 0 };
    for (const a of latestPerDomain) for (const i of a.issues) severity[i.severity] += 1;

    const best = completed.reduce<AnalysisDoc | null>((b, a) => (b === null || a.overallScore > b.overallScore ? a : b), null);
    const worst = completed.reduce<AnalysisDoc | null>((w, a) => (w === null || a.overallScore < w.overallScore ? a : w), null);

    return {
        totals: {
            analyses: analyses.length,
            completed: completed.length,
            failed: analyses.filter((a) => a.status === "failed").length,
            processing: analyses.filter((a) => a.status === "processing" || a.status === "pending").length,
            thisWeek: analyses.filter((a) => new Date(a.createdAt) >= weekAgo).length,
            domains: byDomain.size,
        },
        avgScore: avg(completed.map((a) => a.overallScore)),
        best: best ? { id: best._id.toString(), host: host(best.url), score: best.overallScore } : null,
        worst: worst ? { id: worst._id.toString(), host: host(worst.url), score: worst.overallScore } : null,
        series,
        categories,
        domains,
        recurring,
        severity,
        rank: buildRankSummary(trackings),
    };
}
