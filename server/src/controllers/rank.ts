import type { Request, Response } from "express";
import { KeywordTracking } from "../models/KeywordTracking.ts";
import { keywordTracking } from "../services/keywordTracking.ts";
import { isCountry, isLanguage, type CountryCode, type LanguageCode } from "../config/locales.ts";

const BULK_MAX = 50;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseTarget(url: unknown): { href: string; domain: string } | null {
    if (typeof url !== "string" || !url.trim()) return null;
    try {
        const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
        return { href: parsed.href, domain: parsed.hostname.replace(/^www\./, "") };
    } catch {
        return null;
    }
}

function parseLocale(body: Record<string, unknown>): { country: CountryCode; language: LanguageCode } {
    return { country: isCountry(body.country) ? body.country : "us", language: isLanguage(body.language) ? body.language : "en" };
}

const own = (req: Request) => ({ _id: req.params.id, userId: req.userId });

export async function addKeyword(req: Request, res: Response) {
    const { keyword, url } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof keyword !== "string" || typeof url !== "string" || !keyword.trim() || !url.trim()) {
        return res.status(400).json({ success: false, message: "Keyword and URL are required" });
    }

    const target = parseTarget(url);
    if (!target) return res.status(400).json({ success: false, message: "Enter a valid URL" });
    const locale = parseLocale(req.body as Record<string, unknown>);
    const cleanKeyword = keyword.toLowerCase().trim();

    if (await KeywordTracking.exists({ userId: req.userId, keyword: cleanKeyword, domain: target.domain, country: locale.country })) {
        return res.status(400).json({ success: false, message: "Already tracking this keyword for this domain and country" });
    }

    const tracking = await KeywordTracking.create({ userId: req.userId, keyword: cleanKeyword, url: target.href, domain: target.domain, ...locale, status: "checking" });
    res.status(201).json({ success: true, message: "Keyword tracking started", tracking });
    void keywordTracking(tracking);
}

/** Add many keywords at once. Checks run one after another in the background. */
export async function addKeywordsBulk(req: Request, res: Response) {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const raw = Array.isArray(body.keywords) ? body.keywords : typeof body.keywords === "string" ? body.keywords.split(/\r?\n|,/) : [];
    const keywords = [...new Set(raw.map((k) => String(k).toLowerCase().trim()).filter((k) => k.length > 1 && k.length <= 120))];
    if (!keywords.length) return res.status(400).json({ success: false, message: "Add at least one keyword" });
    if (keywords.length > BULK_MAX) return res.status(400).json({ success: false, message: `Up to ${BULK_MAX} keywords at a time` });

    const target = parseTarget(body.url);
    if (!target) return res.status(400).json({ success: false, message: "Enter a valid URL" });
    const locale = parseLocale(body);

    const existing = new Set((await KeywordTracking.find({ userId: req.userId, domain: target.domain, country: locale.country, keyword: { $in: keywords } }).select("keyword")).map((k) => k.keyword));
    const fresh = keywords.filter((k) => !existing.has(k));
    const inserted = fresh.length ? await KeywordTracking.insertMany(fresh.map((keyword) => ({ userId: req.userId, keyword, url: target.href, domain: target.domain, ...locale, status: "checking" }))) : [];
    const created = inserted.length ? await KeywordTracking.find({ _id: { $in: inserted.map((d) => d._id) } }).select("-rankHistory") : [];

    res.status(201).json({ success: true, created, skipped: [...existing] });

    void (async () => {
        for (const tracking of created) {
            await keywordTracking(tracking);
            await sleep(5000);
        }
    })();
}

export async function getKeywords(req: Request, res: Response) {
    const keywords = await KeywordTracking.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-rankHistory");
    res.json({ success: true, keywords });
}

export async function getKeyword(req: Request, res: Response) {
    const tracking = await KeywordTracking.findOne(own(req));
    if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
    res.json({ success: true, tracking });
}

export async function refreshKeyword(req: Request, res: Response) {
    const tracking = await KeywordTracking.findOne(own(req));
    if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
    if (tracking.status === "checking") return res.status(409).json({ success: false, message: "A check is already running" });
    tracking.status = "checking";
    await tracking.save();
    res.json({ success: true, message: "Rank check started" });
    void keywordTracking(tracking);
}

export async function toggleTracking(req: Request, res: Response) {
    const tracking = await KeywordTracking.findOne(own(req));
    if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
    tracking.active = !tracking.active;
    await tracking.save();
    res.json({ success: true, tracking });
}

export async function deleteKeyword(req: Request, res: Response) {
    const deleted = await KeywordTracking.findOneAndDelete(own(req));
    if (!deleted) return res.status(404).json({ success: false, message: "Keyword not found" });
    res.json({ success: true, message: "Keyword tracking deleted" });
}
