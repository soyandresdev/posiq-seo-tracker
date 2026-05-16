/** Shapes shared with the client (mirrored in client/src/types/api.ts). */
export type Severity = "critical" | "warning" | "info";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";
export type TrackingStatus = "pending" | "checking" | "completed" | "failed";
export type Plan = "free" | "pro";

export interface Categories {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
}

export interface Issue {
    severity: Severity;
    category: string;
    message: string;
    recommendation: string;
}

export interface Keyword {
    word: string;
    count: number;
    density: number;
}

export interface MetaData {
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
}

export interface Headings {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    h1Texts: string[];
}

export interface ScrapedData {
    url: string;
    statusCode: number;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    bodyText: string;
    metaData: MetaData;
    headings: Headings;
    links: { internal: number; external: number; total: number };
    images: { total: number; missingAlt: number; withAlt: number };
}

export interface AiAnalysis {
    overallScore: number;
    categories: Categories;
    keywords: Keyword[];
    issues: Issue[];
}

export interface SerpResult {
    position: number;
    url: string;
    domain: string;
    title: string;
    snippet: string;
}

export interface RankCheck {
    keyword: string;
    targetDomain: string;
    position: number | null;
    page: number | null;
    title: string;
    snippet: string;
    competitors: SerpResult[];
    totalResultsScanned: number;
}

export type Result<T> = { success: true; data: T } | { success: false; error: string };
