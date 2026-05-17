import { Bell, Search } from "lucide-react";
import { Logo } from "../ui";
import StatTile from "../app/StatTile";
import DashboardOverview from "../app/DashboardOverview";
import type { DashboardSummary } from "../../types/api";

const NOW = Date.now();
const day = 86400000;
const iso = (d: number) => new Date(NOW - d * day).toISOString();

/** Static, realistic summary so the hero shows the real dashboard components. */
const summary: DashboardSummary = {
  totals: {
    analyses: 24,
    completed: 22,
    failed: 1,
    processing: 1,
    thisWeek: 6,
    domains: 4,
  },
  avgScore: 78,
  best: { id: "demo", host: "stripe.com", score: 91 },
  worst: { id: "demo", host: "old-blog.net", score: 52 },
  series: Array.from({ length: 30 }, (_, i) => ({
    date: iso(29 - i).slice(0, 10),
    score: i % 3 === 0 ? Math.round(62 + i * 0.6 + Math.sin(i / 3) * 5) : null,
    analyses: i % 3 === 0 ? 1 + (i % 2) : 0,
  })),
  categories: {
    seo: 82,
    performance: 64,
    accessibility: 88,
    bestPractices: 79,
  },
  domains: [
    {
      domain: "stripe.com",
      analyses: 8,
      latestId: "demo",
      latestScore: 91,
      previousScore: 85,
      change: 6,
      lastAnalyzed: iso(0),
      openIssues: 3,
    },
    {
      domain: "vercel.com",
      analyses: 5,
      latestId: "demo",
      latestScore: 88,
      previousScore: 88,
      change: 0,
      lastAnalyzed: iso(1),
      openIssues: 4,
    },
    {
      domain: "amazon.in",
      analyses: 6,
      latestId: "demo",
      latestScore: 72,
      previousScore: 75,
      change: -3,
      lastAnalyzed: iso(2),
      openIssues: 9,
    },
    {
      domain: "old-blog.net",
      analyses: 3,
      latestId: "demo",
      latestScore: 52,
      previousScore: null,
      change: null,
      lastAnalyzed: iso(4),
      openIssues: 12,
    },
  ],
  recurring: [
    { id: "alt", label: "All images have alt text", count: 3 },
    {
      id: "description-length",
      label: "Description between 70 and 160 characters",
      count: 2,
    },
    { id: "og-image", label: "Open Graph image", count: 2 },
    { id: "h1", label: "Exactly one H1", count: 1 },
  ],
  severity: { critical: 4, warning: 11, info: 13 },
  rank: {
    totals: { tracked: 12, active: 11, paused: 1, checking: 0, failed: 0 },
    visibility: 41.2,
    visibilityChange: 3.8,
    avgPosition: 8.4,
    series: [],
    distribution: {
      top3: 3,
      top10: 4,
      top20: 2,
      top50: 2,
      notFound: 1,
      pending: 0,
    },
    movers: {
      up: [
        {
          id: "demo",
          keyword: "seo rank tracker",
          country: "us",
          position: 4,
          change: 2,
        },
        {
          id: "demo2",
          keyword: "keyword position checker",
          country: "co",
          position: 9,
          change: 5,
        },
      ],
      down: [
        {
          id: "demo3",
          keyword: "ai seo audit",
          country: "es",
          position: 17,
          change: -3,
        },
      ],
    },
    competitors: [],
    status: { lastRun: iso(0), nextRun: iso(-1), okToday: 12, failedToday: 0 },
  },
};

/** The real dashboard, framed like a browser window. Links inside are decorative. */
export default function ProductMockup() {
  return (
    <div
      className="rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl p-2 shadow-float pointer-events-none select-none"
      aria-hidden
    >
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-10 border-b border-border bg-muted/60">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto h-6 w-72 max-w-[50%] rounded-md bg-card border border-border text-[11px] text-muted-foreground grid place-items-center">
            app.rankpilot.dev/dashboard
          </div>
        </div>
        <div className="flex items-center justify-between px-5 h-14">
          <Logo />
          <div className="hidden sm:flex items-center gap-2 h-9 w-72 rounded-full bg-muted px-3 text-sm text-muted-foreground">
            <Search size={14} /> Search
          </div>
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-muted-foreground" />
            <span className="size-8 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
              A
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 space-y-4 bg-background/60">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Audits" value={24} hint="6 this week" />
            <StatTile
              label="Avg score"
              value={78}
              tone="var(--color-warning)"
              hint="4 domains"
            />
            <StatTile label="Keywords" value={12} hint="visibility 41.2" />
            <StatTile
              label="Left today"
              accent="blue"
              value="∞"
              hint="Pro plan"
            />
          </div>
          <DashboardOverview s={summary} />
        </div>
      </div>
    </div>
  );
}
