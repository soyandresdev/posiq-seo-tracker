import type { Check, ScrapedData } from "../types/api.ts";

type Rule = { id: string; label: string; category: Check["category"]; test: (d: ScrapedData) => { passed: boolean; detail: string } };

const between = (n: number, lo: number, hi: number) => n >= lo && n <= hi;

const rules: Rule[] = [
    { id: "status", label: "Page responds with 200", category: "bestPractices", test: (d) => ({ passed: d.statusCode === 200, detail: `Status ${d.statusCode || "unknown"}` }) },
    { id: "title", label: "Title tag present", category: "seo", test: (d) => ({ passed: d.metaData.title.trim().length > 0, detail: d.metaData.title ? `"${d.metaData.title.slice(0, 60)}"` : "No <title> found" }) },
    { id: "title-length", label: "Title between 30 and 65 characters", category: "seo", test: (d) => ({ passed: between(d.metaData.title.length, 30, 65), detail: `${d.metaData.title.length} characters (50–60 is ideal)` }) },
    { id: "description", label: "Meta description present", category: "seo", test: (d) => ({ passed: d.metaData.description.trim().length > 0, detail: d.metaData.description ? "Found" : "Missing meta description" }) },
    { id: "description-length", label: "Description between 70 and 160 characters", category: "seo", test: (d) => ({ passed: between(d.metaData.description.length, 70, 160), detail: `${d.metaData.description.length} characters (150–160 is ideal)` }) },
    { id: "h1", label: "Exactly one H1", category: "seo", test: (d) => ({ passed: d.headings.h1 === 1, detail: `${d.headings.h1} H1 tag${d.headings.h1 === 1 ? "" : "s"}` }) },
    { id: "heading-order", label: "Heading levels are not skipped", category: "seo", test: (d) => { const h = d.headings; const skipped = (h.h3 > 0 && h.h2 === 0) || (h.h4 > 0 && h.h3 === 0) || (h.h5 > 0 && h.h4 === 0); return { passed: !skipped, detail: skipped ? "A heading level is used without its parent level" : `H1 ${h.h1} · H2 ${h.h2} · H3 ${h.h3}` }; } },
    { id: "canonical", label: "Canonical URL set", category: "seo", test: (d) => ({ passed: d.metaData.canonical.length > 0, detail: d.metaData.canonical || "No canonical link" }) },
    { id: "robots", label: "Not blocked by robots meta", category: "seo", test: (d) => ({ passed: !/noindex/i.test(d.metaData.robots), detail: d.metaData.robots ? `robots: ${d.metaData.robots}` : "No robots meta (indexable)" }) },
    { id: "word-count", label: "At least 300 words of content", category: "seo", test: (d) => ({ passed: d.wordCount >= 300, detail: `${d.wordCount.toLocaleString()} words` }) },
    { id: "internal-links", label: "Has internal links", category: "seo", test: (d) => ({ passed: d.links.internal >= 3, detail: `${d.links.internal} internal, ${d.links.external} external` }) },
    { id: "og-title", label: "Open Graph title", category: "bestPractices", test: (d) => ({ passed: d.metaData.ogTitle.length > 0, detail: d.metaData.ogTitle ? "Found" : "Missing og:title" }) },
    { id: "og-description", label: "Open Graph description", category: "bestPractices", test: (d) => ({ passed: d.metaData.ogDescription.length > 0, detail: d.metaData.ogDescription ? "Found" : "Missing og:description" }) },
    { id: "og-image", label: "Open Graph image", category: "bestPractices", test: (d) => ({ passed: d.metaData.ogImage.length > 0, detail: d.metaData.ogImage ? "Found" : "Missing og:image, links will have no preview" }) },
    { id: "twitter-card", label: "Twitter card type", category: "bestPractices", test: (d) => ({ passed: d.metaData.twitterCard.length > 0, detail: d.metaData.twitterCard || "Missing twitter:card" }) },
    { id: "viewport", label: "Viewport meta for mobile", category: "bestPractices", test: (d) => ({ passed: /width=device-width/i.test(d.metaData.viewport), detail: d.metaData.viewport || "Missing viewport meta" }) },
    { id: "charset", label: "Charset declared", category: "bestPractices", test: (d) => ({ passed: d.metaData.charset.length > 0, detail: d.metaData.charset || "No <meta charset>" }) },
    { id: "alt", label: "All images have alt text", category: "accessibility", test: (d) => ({ passed: d.images.missingAlt === 0, detail: `${d.images.missingAlt} of ${d.images.total} images missing alt` }) },
    { id: "load-time", label: "Loads in under 3 seconds", category: "performance", test: (d) => ({ passed: d.loadTime < 3000, detail: `${(d.loadTime / 1000).toFixed(1)}s to DOMContentLoaded` }) },
    { id: "page-size", label: "HTML under 1 MB", category: "performance", test: (d) => ({ passed: d.pageSize < 1_048_576, detail: `${Math.round(d.pageSize / 1024)} KB of HTML` }) },
];

/** Deterministic pass/fail checks computed from scraped data. No AI involved. */
export function runChecks(d: ScrapedData): Check[] {
    return rules.map((r) => ({ id: r.id, label: r.label, category: r.category, ...r.test(d) }));
}
