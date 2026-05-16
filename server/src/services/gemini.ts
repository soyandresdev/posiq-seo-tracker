import { GoogleGenAI, Type } from "@google/genai";
import { env } from "../config/env.ts";
import type { AiAnalysis, Check, Result, ScrapedData } from "../types/api.ts";

const ai = new GoogleGenAI({ apiKey: env.geminiKey });

const schema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        overallScore: { type: Type.INTEGER },
        categories: {
            type: Type.OBJECT,
            properties: { seo: { type: Type.INTEGER }, performance: { type: Type.INTEGER }, accessibility: { type: Type.INTEGER }, bestPractices: { type: Type.INTEGER } },
            required: ["seo", "performance", "accessibility", "bestPractices"],
        },
        keywords: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, count: { type: Type.INTEGER }, density: { type: Type.NUMBER } }, required: ["word", "count", "density"] },
        },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: { type: Type.STRING, format: "enum", enum: ["critical", "warning", "info"] },
                    category: { type: Type.STRING },
                    message: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    impact: { type: Type.STRING, format: "enum", enum: ["high", "medium", "low"] },
                    effort: { type: Type.STRING, format: "enum", enum: ["quick", "medium", "large"] },
                    snippet: { type: Type.STRING },
                },
                required: ["severity", "category", "message", "recommendation", "impact", "effort", "snippet"],
            },
        },
    },
    required: ["summary", "overallScore", "categories", "keywords", "issues"],
};

function buildPrompt(d: ScrapedData, checks: Check[]) {
    const m = d.metaData;
    const checklist = checks.map((c) => `- [${c.passed ? "PASS" : "FAIL"}] ${c.label}: ${c.detail}`).join("\n");
    return `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${d.url}
Load Time: ${d.loadTime}ms
Status Code: ${d.statusCode}
Page Size: ${Math.round(d.pageSize / 1024)}KB
Word Count: ${d.wordCount}

META DATA:
- Title: "${m.title}" (${m.title.length} chars)
- Description: "${m.description}" (${m.description.length} chars)
- Canonical: "${m.canonical}"
- Robots: "${m.robots}"
- OG Title: "${m.ogTitle}"
- OG Description: "${m.ogDescription}"
- OG Image: "${m.ogImage}"
- Twitter Card: "${m.twitterCard}"
- Viewport: "${m.viewport}"
- Charset: "${m.charset}"

HEADINGS:
- H1: ${d.headings.h1} (texts: ${JSON.stringify(d.headings.h1Texts)})
- H2: ${d.headings.h2}
- H3: ${d.headings.h3}
- H4: ${d.headings.h4}
- H5: ${d.headings.h5}
- H6: ${d.headings.h6}

LINKS:
- Internal: ${d.links.internal}
- External: ${d.links.external}
- Total: ${d.links.total}

IMAGES:
- Total: ${d.images.total}
- Missing Alt Text: ${d.images.missingAlt}
- With Alt Text: ${d.images.withAlt}

AUTOMATED CHECKS (already verified, use them as ground truth):
${checklist}

PAGE CONTENT (first 3000 chars):
${d.bodyText}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of: "critical", "warning", or "info".
Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
For each issue set impact (high/medium/low: effect on rankings and users) and effort (quick: under 30 minutes, medium: a few hours, large: a project).
When a fix is a concrete tag or attribute, put the exact code to paste in "snippet" (for example a complete <meta> or <title> tag written for this page); otherwise leave snippet empty.
Write "summary" as 2-3 plain sentences for the site owner: overall state, the single most important problem, and what to do first. No markdown.
Extract top 10 keywords by frequency from the page content.`;
}

const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/** Score scraped data with Gemini using a strict JSON schema. */
export async function analyzeSeoData(data: ScrapedData, checks: Check[] = []): Promise<Result<AiAnalysis>> {
    try {
        const response = await ai.models.generateContent({
            model: env.geminiModel,
            contents: [{ role: "user", parts: [{ text: buildPrompt(data, checks) }] }],
            config: { responseMimeType: "application/json", responseSchema: schema },
        });
        const raw = JSON.parse(response.text ?? "{}") as Partial<AiAnalysis>;
        const analysis: AiAnalysis = {
            summary: String(raw.summary ?? "").trim(),
            overallScore: clamp(raw.overallScore),
            categories: {
                seo: clamp(raw.categories?.seo),
                performance: clamp(raw.categories?.performance),
                accessibility: clamp(raw.categories?.accessibility),
                bestPractices: clamp(raw.categories?.bestPractices),
            },
            keywords: (raw.keywords ?? []).slice(0, 15),
            issues: (raw.issues ?? [])
                .filter((i) => ["critical", "warning", "info"].includes(i.severity))
                .map((i) => ({
                    ...i,
                    impact: ["high", "medium", "low"].includes(i.impact) ? i.impact : "medium",
                    effort: ["quick", "medium", "large"].includes(i.effort) ? i.effort : "medium",
                    snippet: typeof i.snippet === "string" ? i.snippet.trim() : "",
                })),
        };
        return { success: true, data: analysis };
    } catch (err) {
        const message = (err as Error).message;
        console.error("[gemini] failed:", message);
        return { success: false, error: message };
    }
}
