import type { AnalysisDoc } from "../models/Analysis.ts";

/** Compact report context for the assistant. Keeps tokens low, keeps facts exact. */
export function reportContext(a: AnalysisDoc) {
    const failed = (a.checks ?? []).filter((c) => !c.passed).map((c) => `${c.label} (${c.detail})`);
    const passed = (a.checks ?? []).filter((c) => c.passed).map((c) => c.label);
    return JSON.stringify(
        {
            url: a.url,
            analyzedAt: a.createdAt,
            summary: a.summary,
            scores: { overall: a.overallScore, ...a.categories },
            facts: { loadTimeMs: a.loadTime, pageSizeBytes: a.pageSize, wordCount: a.wordCount },
            meta: a.metaData,
            headings: a.headings,
            links: a.links,
            images: a.images,
            topKeywords: (a.keywords ?? []).slice(0, 10).map((k) => `${k.word} (${k.count}, ${k.density}%)`),
            checksFailed: failed,
            checksPassed: passed,
            issues: (a.issues ?? []).map((i) => ({ severity: i.severity, impact: i.impact, effort: i.effort, category: i.category, message: i.message, recommendation: i.recommendation, snippet: i.snippet || undefined })),
        },
        null,
        0
    );
}

export function systemInstruction(a: AnalysisDoc) {
    return `You are Posiq's SEO assistant, helping the owner of ${a.url} act on their audit report.

Rules:
- Ground every answer in the REPORT below. Quote the exact numbers, tags and issues it contains. If something is not in the report, say you can't see it rather than guessing.
- Be concrete and brief. Prefer numbered steps and short paragraphs. Use markdown: **bold** for emphasis, lists, and fenced code blocks for any HTML, meta tags or copy the user should paste.
- When asked to write a title, description, H1 or alt text, write it for this page and keep lengths within limits (title 50–60 chars, description 150–160 chars). Show the character count.
- Prioritize by impact and effort. Quick wins first.
- Never invent traffic, rankings or competitor data.
- Answer in the language the user writes in.

REPORT:
${reportContext(a)}`;
}
