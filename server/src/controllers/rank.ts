import type { Request, Response } from "express";
import { KeywordTracking } from "../models/KeywordTracking.ts";
import { keywordTracking } from "../services/keywordTracking.ts";

const own = (req: Request) => ({ _id: req.params.id, userId: req.userId });

export async function addKeyword(req: Request, res: Response) {
    const { keyword, url } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof keyword !== "string" || typeof url !== "string" || !keyword.trim() || !url.trim()) {
        return res.status(400).json({ success: false, message: "Keyword and URL are required" });
    }

    let parsed: URL;
    try {
        parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
        return res.status(400).json({ success: false, message: "Enter a valid URL" });
    }
    const domain = parsed.hostname.replace(/^www\./, "");
    const cleanKeyword = keyword.toLowerCase().trim();

    if (await KeywordTracking.exists({ userId: req.userId, keyword: cleanKeyword, domain })) {
        return res.status(400).json({ success: false, message: "Already tracking this keyword for this domain" });
    }

    const tracking = await KeywordTracking.create({ userId: req.userId, keyword: cleanKeyword, url: parsed.href, domain, status: "checking" });
    res.status(201).json({ success: true, message: "Keyword tracking started", tracking });
    void keywordTracking(tracking);
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
