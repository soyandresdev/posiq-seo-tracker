import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button, Container, Gauge } from "../components/ui";
import IssueCard from "../components/IssueCard";
import { isQuickWin } from "../lib/issues";
import Checklist from "../components/app/Checklist";
import { SerpPreview, SocialPreview } from "../components/app/Previews";
import Assistant from "../components/app/Assistant";
import { Sparkles, Zap } from "lucide-react";
import EmptyState from "../components/app/EmptyState";
import { Skeleton } from "../components/app/Skeleton";
import { gsap, useGsap, prefersReducedMotion } from "../lib/gsap";
import { scoreClass, scoreTone } from "../lib/score";
import { formatBytes, formatDate, formatMs } from "../lib/format";
import { hostnameOf, type Analysis, type Severity } from "../types/api";

type Tab = "overview" | "meta" | "content" | "issues";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "meta", label: "Meta" },
  { id: "content", label: "Content" },
  { id: "issues", label: "Issues" },
];
const severityOrder: Severity[] = ["critical", "warning", "info"];
const impactOrder = { high: 0, medium: 1, low: 2 } as const;
const byPriority = (
  x: Analysis["issues"][number],
  y: Analysis["issues"][number],
) =>
  impactOrder[x.impact ?? "medium"] - impactOrder[y.impact ?? "medium"] ||
  severityOrder.indexOf(x.severity) - severityOrder.indexOf(y.severity);

export default function Report() {
  const { id } = useParams();
  const { api } = useApp();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const { data } = await api.get(`/api/analysis/${id}`);
        if (cancelled) return;
        if (!data.success) return setError("Analysis not found");
        if (
          data.analysis.status === "processing" ||
          data.analysis.status === "pending"
        ) {
          timer = setTimeout(load, 2000);
          return;
        }
        setAnalysis(data.analysis);
      } catch {
        if (!cancelled) setError("Could not load this report");
      }
    };
    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [api, id]);

  // Tab swap: crossfade with a small directional hint
  useGsap(() => {
    if (!panel.current) return;
    gsap.fromTo(
      panel.current,
      { autoAlpha: 0, y: prefersReducedMotion() ? 0 : 6 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: "expo.out", overwrite: true },
    );
  }, [tab]);

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
    analysis?.issues.forEach((i) => (c[i.severity] += 1));
    return c;
  }, [analysis]);

  if (error)
    return (
      <EmptyState
        title={error}
        action={<Button to="/dashboard">Back to dashboard</Button>}
      />
    );
  if (!analysis) return <ReportSkeleton />;
  if (analysis.status === "failed")
    return (
      <EmptyState
        title="This analysis failed."
        description="The site may block automated browsers, or the model was unavailable."
        action={
          <Button to={`/analyze?url=${encodeURIComponent(analysis.url)}`}>
            Try again
          </Button>
        }
      />
    );

  const a = analysis;
  const cats = [
    ["SEO", a.categories.seo],
    ["Performance", a.categories.performance],
    ["Accessibility", a.categories.accessibility],
    ["Best practices", a.categories.bestPractices],
  ] as const;

  return (
    <Container size="wide" as="main" className="pt-24 pb-24">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> History
      </Link>

      <header className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="eyebrow mb-2 text-primary-dark">
            Report ·{" "}
            {formatDate(a.createdAt, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <h1 className="font-display text-display-md truncate">
            {hostnameOf(a.url)}
          </h1>
          <a
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-full"
          >
            {a.url} <ArrowUpRight size={13} />
          </a>
        </div>
        <Button
          variant="secondary"
          to={`/analyze?url=${encodeURIComponent(a.url)}`}
          icon={<RefreshCw size={14} />}
        >
          Re-run
        </Button>
      </header>

      {/* Score strip */}
      <section className="mt-8 card p-6 md:p-8 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3 flex items-center gap-6">
          <Gauge
            value={a.overallScore}
            size={150}
            stroke={12}
            label="Overall"
            trigger="mount"
          />
        </div>
        <Bars items={cats} className="md:col-span-6" />
        <dl className="md:col-span-3 grid grid-cols-3 md:grid-cols-1 gap-4 md:border-l md:border-border md:pl-8">
          {[
            ["Load time", formatMs(a.loadTime)],
            ["Page size", formatBytes(a.pageSize)],
            ["Words", a.wordCount.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd className="font-heavy text-display-sm mt-1 tracking-tight">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {(a.summary || a.issues.some(isQuickWin)) && (
        <Summary a={a} onSeeAll={() => setTab("issues")} />
      )}

      {/* Tabs */}
      <div
        role="tablist"
        className="mt-8 inline-flex h-10 p-1 rounded-full bg-muted overflow-x-auto max-w-full"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${tab === t.id ? "bg-card text-primary-dark shadow-card" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
            {t.id === "issues" && (
              <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                {a.issues.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div ref={panel} className="mt-6 card p-6 md:p-8">
        {tab === "overview" && (
          <Overview a={a} counts={counts} onSeeAll={() => setTab("issues")} />
        )}
        {tab === "meta" && <Meta a={a} />}
        {tab === "content" && <Content a={a} />}
        {tab === "issues" && <Issues a={a} counts={counts} />}
      </div>

      <Assistant analysisId={a._id} host={hostnameOf(a.url)} />
    </Container>
  );
}

function Bars({
  items,
  className = "",
}: {
  items: readonly (readonly [string, number])[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(() => {
    if (!ref.current) return;
    gsap.from(ref.current.querySelectorAll("[data-fill]"), {
      scaleX: 0,
      transformOrigin: "left center",
      duration: prefersReducedMotion() ? 0.01 : 1.1,
      ease: "expo.out",
      stagger: 0.07,
    });
  }, []);
  return (
    <div ref={ref} className={`space-y-5 self-center ${className}`}>
      {items.map(([name, v]) => (
        <div
          key={name}
          className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-4 text-sm"
        >
          <span className="text-muted-foreground">{name}</span>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              data-fill
              className="h-full rounded-full"
              style={{ width: `${v}%`, background: scoreTone(v) }}
            />
          </div>
          <span className={`tabular-nums text-right ${scoreClass(v)}`}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Summary({ a, onSeeAll }: { a: Analysis; onSeeAll: () => void }) {
  const wins = a.issues.filter(isQuickWin).slice(0, 3);
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-12">
      {a.summary && (
        <div className="lg:col-span-7 card p-6 md:p-8 bg-gradient-to-br from-lavender/80 to-card">
          <div className="flex items-center gap-2 text-primary-dark text-sm font-semibold">
            <Sparkles size={15} /> Summary
          </div>
          <p className="mt-3 text-lg leading-relaxed text-pretty">
            {a.summary}
          </p>
        </div>
      )}
      {wins.length > 0 && (
        <div
          className={`${a.summary ? "lg:col-span-5" : "lg:col-span-12"} card p-6`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-6 rounded-full bg-lavender text-primary-dark grid place-items-center">
              <Zap size={12} strokeWidth={3} />
            </span>
            Quick wins
            <span className="text-muted-foreground font-medium">
              · high impact, under 30 minutes
            </span>
          </div>
          <ol className="mt-4 space-y-3">
            {wins.map((w, i) => (
              <li key={w.message} className="flex gap-3 text-sm">
                <span className="font-heavy text-primary-dark tabular-nums">
                  0{i + 1}
                </span>
                <span>
                  <span className="font-semibold">{w.message}</span>
                  <span className="block text-muted-foreground text-xs mt-0.5 line-clamp-2">
                    {w.recommendation}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <Button variant="link" size="sm" onClick={onSeeAll} className="mt-4">
            Open all issues
          </Button>
        </div>
      )}
    </section>
  );
}

function Overview({
  a,
  counts,
  onSeeAll,
}: {
  a: Analysis;
  counts: Record<Severity, number>;
  onSeeAll: () => void;
}) {
  const top = [...a.issues].sort(byPriority).slice(0, 3);
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-12">
        {a.checks && a.checks.length > 0 && (
          <Section title="Checklist">
            <Checklist checks={a.checks} />
          </Section>
        )}
        <Section title="Issues">
          <div className="grid grid-cols-3 rounded-xl bg-muted/60 divide-x divide-border">
            {severityOrder.map((s) => (
              <div key={s} className="py-4 px-5">
                <div
                  className={`font-heavy text-display-sm tabular-nums tracking-tight ${s === "critical" ? "text-danger" : s === "warning" ? "text-warning" : ""}`}
                >
                  {counts[s]}
                </div>
                <div className="eyebrow mt-1">{s}</div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            {top.map((i, idx) => (
              <IssueCard key={idx} issue={i} />
            ))}
          </div>
          {a.issues.length > 3 && (
            <Button
              variant="link"
              size="sm"
              onClick={onSeeAll}
              className="mt-4"
            >
              See all {a.issues.length} issues
            </Button>
          )}
        </Section>
      </div>
      <div className="lg:col-span-5 space-y-12">
        <Section title="Google preview">
          <SerpPreview a={a} />
        </Section>
        <Section title="Links">
          <Facts
            rows={[
              ["Internal", a.links.internal],
              ["External", a.links.external],
              [
                "Broken",
                a.links.broken,
                a.links.broken > 0 ? "text-danger" : "",
              ],
              ["Total", a.links.total],
            ]}
          />
        </Section>
        <Section title="Images">
          <Facts
            rows={[
              ["Total", a.images.total],
              ["With alt", a.images.withAlt],
              [
                "Missing alt",
                a.images.missingAlt,
                a.images.missingAlt > 0 ? "text-warning" : "",
              ],
            ]}
          />
        </Section>
        <Section title="Top keywords">
          <Keywords a={a} limit={6} />
        </Section>
      </div>
    </div>
  );
}

function Facts({
  rows,
}: {
  rows: (readonly [string, string | number, string?])[];
}) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([k, v, cls]) => (
        <div
          key={k}
          className="flex items-baseline justify-between py-3 text-sm"
        >
          <dt className="text-muted-foreground">{k}</dt>
          <dd className={`tabular-nums ${cls ?? ""}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Keywords({ a, limit }: { a: Analysis; limit?: number }) {
  const list = limit ? a.keywords.slice(0, limit) : a.keywords;
  const max = Math.max(1, ...list.map((k) => k.count));
  if (!list.length)
    return (
      <p className="text-sm text-muted-foreground">No keywords extracted.</p>
    );
  return (
    <ul className="divide-y divide-border">
      {list.map((k) => (
        <li
          key={k.word}
          className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2.5 text-sm"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="truncate">{k.word}</span>
            <span
              className="h-1.5 rounded-full bg-primary/70"
              style={{ width: `${(k.count / max) * 80}px` }}
            />
          </span>
          <span className="tabular-nums text-muted-foreground">{k.count}×</span>
          <span className="tabular-nums text-muted-foreground w-14 text-right">
            {k.density.toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function Meta({ a }: { a: Analysis }) {
  const m = a.metaData;
  const rows: [string, string][] = [
    ["Title", m.title],
    ["Description", m.description],
    ["Canonical", m.canonical],
    ["Robots", m.robots],
    ["Viewport", m.viewport],
    ["Charset", m.charset],
    ["og:title", m.ogTitle],
    ["og:description", m.ogDescription],
    ["og:image", m.ogImage],
    ["twitter:card", m.twitterCard],
  ];
  return (
    <div className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <Section title="Google preview">
          <SerpPreview a={a} />
        </Section>
        <Section title="Social preview">
          <SocialPreview a={a} />
        </Section>
      </div>
      <Section title="All meta tags">
        <dl className="divide-y divide-border max-w-4xl">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[9rem_1fr] gap-4 py-4 text-sm"
            >
              <dt className="eyebrow pt-0.5">{k}</dt>
              <dd className={`break-words ${v ? "" : "text-danger"}`}>
                {v || "Missing"}
                {k === "Title" && v && (
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                    {v.length} chars
                  </span>
                )}
                {k === "Description" && v && (
                  <span
                    className={`ml-2 text-xs tabular-nums ${v.length > 160 ? "text-warning" : "text-muted-foreground"}`}
                  >
                    {v.length} chars
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

function Content({ a }: { a: Analysis }) {
  const h = a.headings;
  const levels = (["h1", "h2", "h3", "h4", "h5", "h6"] as const).map(
    (l) => [l.toUpperCase(), h[l]] as const,
  );
  const max = Math.max(1, ...levels.map(([, n]) => n));
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Section title="Heading structure">
          <ul className="space-y-3">
            {levels.map(([l, n]) => (
              <li
                key={l}
                className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-3 text-sm"
              >
                <span className="eyebrow">{l}</span>
                <span className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <span
                    className="block h-full bg-primary/70 rounded-full"
                    style={{ width: `${(n / max) * 100}%` }}
                  />
                </span>
                <span
                  className={`tabular-nums text-right ${l === "H1" && n !== 1 ? "text-warning" : ""}`}
                >
                  {n}
                </span>
              </li>
            ))}
          </ul>
          {h.h1Texts.length > 0 && (
            <div className="mt-6">
              <div className="eyebrow mb-2">H1 text</div>
              {h.h1Texts.map((t, i) => (
                <p key={i} className="font-semibold text-lg text-balance">
                  {t}
                </p>
              ))}
            </div>
          )}
        </Section>
      </div>
      <div className="lg:col-span-7">
        <Section title={`Keywords · ${a.keywords.length}`}>
          <Keywords a={a} />
        </Section>
      </div>
    </div>
  );
}

function Issues({
  a,
  counts,
}: {
  a: Analysis;
  counts: Record<Severity, number>;
}) {
  const [filter, setFilter] = useState<Severity | "all" | "wins">("all");
  const winCount = a.issues.filter(isQuickWin).length;
  const list = [...a.issues]
    .filter(
      (i) =>
        filter === "all" ||
        (filter === "wins" ? isQuickWin(i) : i.severity === filter),
    )
    .sort(byPriority);
  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div
          role="tablist"
          aria-label="Severity"
          className="inline-flex h-10 p-1 rounded-full bg-muted"
        >
          {(["all", ...severityOrder] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filter === s}
              onClick={() => setFilter(s)}
              className={`px-3.5 rounded-full text-sm font-medium capitalize transition-colors duration-200 ${filter === s ? "bg-card text-primary-dark shadow-card" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s}
              {s !== "all" && (
                <span className="ml-1.5 text-xs tabular-nums opacity-70">
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>
        {winCount > 0 && (
          <button
            onClick={() => setFilter(filter === "wins" ? "all" : "wins")}
            aria-pressed={filter === "wins"}
            className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-medium transition-colors ${filter === "wins" ? "bg-primary text-white shadow-primary" : "bg-lavender text-primary-dark hover:bg-lavender-deep"}`}
          >
            <Zap size={13} strokeWidth={3} /> Quick wins{" "}
            <span className="text-xs opacity-70 tabular-nums">{winCount}</span>
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          Sorted by impact
        </span>
      </div>
      {list.length ? (
        <div>
          {list.map((i, idx) => (
            <IssueCard key={`${filter}-${idx}`} issue={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-6">
          Nothing here. Nice.
        </p>
      )}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <Container size="wide" className="pt-24 pb-24">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-72 mt-8" />
      <Skeleton className="h-4 w-96 mt-3" />
      <div className="mt-8 card p-8 grid md:grid-cols-12 gap-10">
        <Skeleton className="size-[140px] rounded-full md:col-span-3" />
        <div className="md:col-span-6 space-y-5 self-center">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
        <div className="md:col-span-3 space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
    </Container>
  );
}
