export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";
export type Severity = "critical" | "warning" | "info";

export interface Categories {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
}

export type Impact = "high" | "medium" | "low";
export type Effort = "quick" | "medium" | "large";

export interface Issue {
    severity: Severity;
    category: string;
    message: string;
    recommendation: string;
    impact?: Impact;
    effort?: Effort;
    snippet?: string;
}

export interface Check {
    id: string;
    label: string;
    category: "seo" | "performance" | "accessibility" | "bestPractices";
    passed: boolean;
    detail: string;
}

export interface Keyword {
    word: string;
    count: number;
    density: number;
}

export interface AnalysisSummary {
    _id: string;
    url: string;
    overallScore: number;
    status: AnalysisStatus;
    categories: Categories;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Analysis extends AnalysisSummary {
    summary?: string;
    checks?: Check[];
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterCard: string;
        viewport: string;
        charset: string;
    };
    headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number; h1Texts: string[] };
    links: { internal: number; external: number; broken: number; total: number };
    images: { total: number; missingAlt: number; withAlt: number };
    keywords: Keyword[];
    issues: Issue[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export type TrackingStatus = "pending" | "checking" | "completed" | "failed";

export interface RankEntry {
    date: string;
    position: number | null;
    page: number | null;
    title: string;
    snippet: string;
}

export interface Competitor {
    position: number;
    url: string;
    domain: string;
    title: string;
    snippet: string;
}

export interface KeywordTracking {
    _id: string;
    keyword: string;
    url: string;
    domain: string;
    currentPosition: number | null;
    currentPage: number | null;
    bestPosition: number | null;
    positionChange: number;
    rankHistory: RankEntry[];
    competitors: Competitor[];
    active: boolean;
    lastChecked: string | null;
    status: TrackingStatus;
    createdAt: string;
    updatedAt: string;
}

/** Hostname for display, falling back to the raw string. */
export function hostnameOf(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

/** Ensure a protocol so the server's URL parser accepts it. */
export function normalizeUrl(raw: string) {
    const v = raw.trim();
    return v.startsWith("http") ? v : `https://${v}`;
}
