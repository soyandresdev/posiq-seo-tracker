import type { Request, Response } from "express";
import { Analysis } from "../models/Analysis.ts";
import { User } from "../models/User.ts";
import { analyzeSeoData } from "../services/gemini.ts";
import { scrapeUrl } from "../services/scraper.ts";
import { consumeAnalysis } from "../services/plan.ts";
import { runChecks } from "../services/checks.ts";
import { analysisDoneEmail } from "../services/email.ts";
import { KeywordTracking } from "../models/KeywordTracking.ts";
import { buildAnalysisSummary } from "../services/analysisSummary.ts";
import type { AnalysisDoc } from "../models/Analysis.ts";

function parseUrl(raw: unknown): URL | null {
    if (typeof raw !== "string" || !raw.trim()) return null;
    try {
        const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
        return u.protocol === "http:" || u.protocol === "https:" ? u : null;
    } catch {
        return null;
    }
}

async function runAnalysis(analysis: AnalysisDoc) {
    try {
        const scraped = await scrapeUrl(analysis.url);
        if (!scraped.success) throw new Error(scraped.error);
        const checks = runChecks(scraped.data);
        const ai = await analyzeSeoData(scraped.data, checks);
        if (!ai.success) throw new Error(ai.error);

        const { data } = scraped;
        analysis.set({
            summary: ai.data.summary,
            checks,
            overallScore: ai.data.overallScore,
            categories: ai.data.categories,
            keywords: ai.data.keywords,
            issues: ai.data.issues,
            metaData: data.metaData,
            headings: data.headings,
            links: { ...data.links, broken: 0 },
            images: data.images,
            loadTime: data.loadTime,
            pageSize: data.pageSize,
            wordCount: data.wordCount,
            status: "completed",
        });
        await analysis.save();
        const owner = await User.findById(analysis.userId).select("email alerts");
        if (owner?.alerts?.analysisDone) {
            await analysisDoneEmail({ to: owner.email, host: new URL(analysis.url).hostname, score: analysis.overallScore, issues: analysis.issues.length, analysisId: analysis._id.toString() }).catch(() => undefined);
        }
    } catch (err) {
        console.error("[analysis] background job failed:", (err as Error).message);
        analysis.status = "failed";
        await analysis.save().catch((e) => console.error("[analysis] could not persist failure:", (e as Error).message));
    }
}

export async function analyzeUrl(req: Request, res: Response) {
    const url = parseUrl((req.body as { url?: unknown } | undefined)?.url);
    if (!url) return res.status(400).json({ success: false, message: "Enter a valid URL" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });

    const quota = await consumeAnalysis(user);
    if (!quota.ok) return res.status(429).json({ success: false, message: quota.message });

    const analysis = await Analysis.create({ userId: user._id, url: url.href, status: "processing" });
    res.json({ success: true, message: "Analysis started", analysisId: analysis._id });

    // Continue after responding; the client polls for the result.
    void runAnalysis(analysis);
}

export async function getAnalysis(req: Request, res: Response) {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
    if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, analysis });
}

export async function getAnalyses(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const filter = { userId: req.userId };

    const [analyses, total] = await Promise.all([
        Analysis.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-issues -keywords -metaData -headings -checks -summary"),
        Analysis.countDocuments(filter),
    ]);

    res.json({ success: true, analyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function deleteAnalysis(req: Request, res: Response) {
    const deleted = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, message: "Analysis deleted" });
}

export async function getAnalysisSummary(req: Request, res: Response) {
    const [analyses, trackings] = await Promise.all([Analysis.find({ userId: req.userId }).select("-metaData -headings -keywords -links -images"), KeywordTracking.find({ userId: req.userId })]);
    res.json({ success: true, summary: buildAnalysisSummary(analyses, trackings) });
}
