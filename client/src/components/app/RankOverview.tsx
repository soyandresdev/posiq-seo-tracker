import { ArrowDown, ArrowUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "../charts/ChartTooltip";
import { axisTick, gridStroke } from "../charts/theme";
import { Skeleton } from "./Skeleton";
import { flag } from "../../lib/locales";
import { formatDate } from "../../lib/format";
import type { Mover, RankSummary } from "../../types/api";

const dayLabel = (iso: string) =>
  formatDate(iso, { day: "numeric", month: "short" });

function Card({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {aside && <div className="text-xs text-muted-foreground">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** Headline number: 0–100 visibility index with a 30-day area. */
function Visibility({ s }: { s: RankSummary }) {
  const data = s.series.map((d) => ({ ...d, label: dayLabel(d.date) }));
  const delta = s.visibilityChange;
  return (
    <Card
      title="Visibility index"
      aside="last 30 days"
      className="lg:col-span-5"
    >
      <div className="flex items-end gap-3">
        <span className="font-heavy text-5xl tracking-tight tabular-nums leading-none">
          {s.visibility}
        </span>
        <span className="text-muted-foreground text-sm mb-1">/ 100</span>
        {delta !== null && (
          <span
            className={`mb-1 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${delta > 0 ? "bg-success/10 text-success" : delta < 0 ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"}`}
          >
            {delta > 0 ? (
              <ArrowUp size={11} strokeWidth={3} />
            ) : delta < 0 ? (
              <ArrowDown size={11} strokeWidth={3} />
            ) : null}
            {Math.abs(delta)} vs 7 days ago
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        A #1 counts 100, a #10 about 13, not found 0. Averaged over checked
        keywords.
      </p>
      <div className="h-36 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="vis-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="label"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
            />
            <YAxis
              domain={[0, 100]}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              cursor={{
                stroke: "var(--color-primary)",
                strokeDasharray: "3 3",
                strokeOpacity: 0.5,
              }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as
                  (typeof data)[number] | undefined;
                if (!active || !p || p.visibility === null) return null;
                return (
                  <ChartTooltip
                    title={p.label}
                    rows={[
                      {
                        label: "Visibility",
                        value: p.visibility,
                        color: "var(--color-primary)",
                      },
                      { label: "Keywords checked", value: p.tracked },
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="visibility"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#vis-fill)"
              dot={false}
              connectNulls
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#fff",
                fill: "var(--color-primary)",
              }}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const buckets = [
  ["top3", "Top 3", "#4c3fe0"],
  ["top10", "4–10", "#6c5cf6"],
  ["top20", "11–20", "#a297ff"],
  ["top50", "21–50", "#d3ccff"],
  ["notFound", "Not found", "#e8e8f3"],
] as const;

/** Where your keywords sit right now, as a single stacked bar. */
function Distribution({ s }: { s: RankSummary }) {
  const total = Object.values(s.distribution).reduce((a, b) => a + b, 0) || 1;
  const row = { name: "keywords", ...s.distribution };
  return (
    <Card
      title="Where you rank"
      aside={`${s.totals.tracked} keywords`}
      className="lg:col-span-4"
    >
      <div className="h-9">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[row]}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={0}
          >
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    rows={buckets.map(([k, label, color]) => ({
                      label,
                      value: s.distribution[k],
                      color,
                    }))}
                  />
                );
              }}
            />
            {buckets.map(([k, , color], i) => (
              <Bar
                key={k}
                dataKey={k}
                stackId="a"
                fill={color}
                radius={
                  i === 0
                    ? [6, 0, 0, 6]
                    : i === buckets.length - 1
                      ? [0, 6, 6, 0]
                      : 0
                }
                animationDuration={700}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
        {buckets.map(([k, label, color]) => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: color }}
              />{" "}
              {label}
            </span>
            <span className="font-semibold tabular-nums">
              {s.distribution[k]}
            </span>
          </li>
        ))}
        {s.distribution.pending > 0 && (
          <li className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending first check</span>
            <span className="font-semibold tabular-nums">
              {s.distribution.pending}
            </span>
          </li>
        )}
      </ul>
    </Card>
  );
}

function Status({ s }: { s: RankSummary }) {
  const rows: [string, React.ReactNode][] = [
    [
      "Last check",
      s.status.lastRun
        ? formatDate(s.status.lastRun, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Never",
    ],
    [
      "Next check",
      formatDate(s.status.nextRun, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ],
    [
      "Checked today",
      `${s.status.okToday} ok · ${s.status.failedToday} failed`,
    ],
    ["Active / paused", `${s.totals.active} / ${s.totals.paused}`],
    ["Average position", s.avgPosition ? `#${s.avgPosition}` : "—"],
  ];
  return (
    <Card
      title="Check status"
      aside={<Clock size={14} />}
      className="lg:col-span-3"
    >
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between py-2 text-sm"
          >
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-semibold tabular-nums text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {s.status.failedToday > 0 && (
        <p className="mt-3 text-xs text-warning font-medium">
          Some checks failed. Google may have blocked the browser; they retry
          tomorrow.
        </p>
      )}
    </Card>
  );
}

function MoverList({ items, up }: { items: Mover[]; up: boolean }) {
  if (!items.length)
    return (
      <p className="text-sm text-muted-foreground py-2">
        Nothing {up ? "moved up" : "dropped"} since the last check.
      </p>
    );
  return (
    <ul className="divide-y divide-border">
      {items.map((m) => (
        <li key={m.id}>
          <Link
            to={`/rank/${m.id}`}
            className="flex items-center justify-between gap-3 py-2 text-sm hover:text-primary-dark"
          >
            <span className="truncate">
              {m.country && <span className="mr-1.5">{flag(m.country)}</span>}
              {m.keyword}
            </span>
            <span className="shrink-0 inline-flex items-center gap-2">
              <span className="font-heavy tabular-nums">#{m.position}</span>
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
              >
                {up ? (
                  <ArrowUp size={10} strokeWidth={3} />
                ) : (
                  <ArrowDown size={10} strokeWidth={3} />
                )}
                {Math.abs(m.change)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Movers({ s }: { s: RankSummary }) {
  return (
    <Card title="Movers since last check" className="lg:col-span-4">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <div className="eyebrow text-success mb-1">Moved up</div>
          <MoverList items={s.movers.up} up />
        </div>
        <div>
          <div className="eyebrow text-danger mb-1">Dropped</div>
          <MoverList items={s.movers.down} up={false} />
        </div>
      </div>
    </Card>
  );
}

function Competitors({ s }: { s: RankSummary }) {
  const max = Math.max(1, ...s.competitors.map((c) => c.keywords));
  return (
    <Card
      title="Who ranks above you"
      aside="across all keywords"
      className="lg:col-span-4"
    >
      {s.competitors.length ? (
        <ul className="space-y-2.5">
          {s.competitors.map((c) => (
            <li key={c.domain} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{c.domain}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {c.keywords} kw · avg #{c.avgPosition}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${(c.keywords / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No competitor data yet. Run a check first.
        </p>
      )}
    </Card>
  );
}

function AvgPosition({ s }: { s: RankSummary }) {
  const data = s.series.map((d) => ({ ...d, label: dayLabel(d.date) }));
  const values = data
    .map((d) => d.avgPosition)
    .filter((v): v is number => v !== null);
  const maxPos = Math.max(10, ...values);
  return (
    <Card
      title="Average position"
      aside="all checked keywords"
      className="lg:col-span-4"
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={gridStroke} />
            <XAxis
              dataKey="label"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
            />
            <YAxis
              reversed
              domain={[1, Math.ceil(maxPos)]}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={36}
              tickFormatter={(v: number) => `#${v}`}
            />
            <Tooltip
              cursor={{
                stroke: "var(--color-primary)",
                strokeDasharray: "3 3",
                strokeOpacity: 0.5,
              }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as
                  (typeof data)[number] | undefined;
                if (!active || !p || p.avgPosition === null) return null;
                return (
                  <ChartTooltip
                    title={p.label}
                    rows={[
                      {
                        label: "Average",
                        value: `#${p.avgPosition}`,
                        color: "var(--color-primary)",
                      },
                      { label: "Keywords", value: p.tracked },
                    ]}
                  />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="avgPosition"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#fff",
                fill: "var(--color-primary)",
              }}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RankOverviewSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Skeleton className="h-64 lg:col-span-5 rounded-2xl!" />
      <Skeleton className="h-64 lg:col-span-4 rounded-2xl!" />
      <Skeleton className="h-64 lg:col-span-3 rounded-2xl!" />
    </div>
  );
}

export default function RankOverview({ s }: { s: RankSummary }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Visibility s={s} />
      <Distribution s={s} />
      <Status s={s} />
      <Movers s={s} />
      <Competitors s={s} />
      <AvgPosition s={s} />
    </div>
  );
}
