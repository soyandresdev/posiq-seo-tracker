import { ArrowDown, ArrowUp, ArrowUpRight, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "../charts/ChartTooltip";
import CategoryBars from "../charts/CategoryBars";
import { axisTick, gridStroke } from "../charts/theme";
import { Skeleton } from "./Skeleton";
import { formatDate } from "../../lib/format";
import { scoreClass, scoreTone } from "../../lib/score";
import { flag } from "../../lib/locales";
import type { DashboardSummary } from "../../types/api";

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

function Delta({
  value,
  suffix = "",
}: {
  value: number | null;
  suffix?: string;
}) {
  if (value === null)
    return <span className="text-xs text-muted-foreground">first run</span>;
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const tone =
    value > 0
      ? "bg-success/10 text-success"
      : value < 0
        ? "bg-danger/10 text-danger"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${tone}`}
    >
      <Icon size={10} strokeWidth={3} />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

function ScoreOverTime({ s }: { s: DashboardSummary }) {
  const data = s.series.map((d) => ({
    ...d,
    label: formatDate(d.date, { day: "numeric", month: "short" }),
  }));
  return (
    <Card
      title="Score over time"
      aside="average per day, last 30 days"
      className="lg:col-span-5"
    >
      <div className="flex items-end gap-3">
        <span
          className={`font-heavy text-5xl tracking-tight tabular-nums leading-none ${s.avgScore !== null ? scoreClass(s.avgScore) : ""}`}
        >
          {s.avgScore ?? "—"}
        </span>
        <span className="text-muted-foreground text-sm mb-1">
          average of {s.totals.completed} audits
        </span>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        {s.best && (
          <Link to={`/report/${s.best.id}`} className="hover:text-foreground">
            Best:{" "}
            <span className="font-semibold text-success">{s.best.score}</span>{" "}
            {s.best.host}
          </Link>
        )}
        {s.worst && s.worst.id !== s.best?.id && (
          <Link to={`/report/${s.worst.id}`} className="hover:text-foreground">
            Lowest:{" "}
            <span className="font-semibold text-danger">{s.worst.score}</span>{" "}
            {s.worst.host}
          </Link>
        )}
      </div>
      <div className="h-36 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
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
                if (!active || !p || p.score === null) return null;
                return (
                  <ChartTooltip
                    title={p.label}
                    rows={[
                      {
                        label: "Average score",
                        value: p.score,
                        color: scoreTone(p.score),
                      },
                      { label: "Audits", value: p.analyses },
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#score-fill)"
              connectNulls
              dot={{ r: 3, strokeWidth: 0, fill: "var(--color-primary)" }}
              activeDot={{
                r: 5,
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

function Categories({ s }: { s: DashboardSummary }) {
  const issues = s.severity;
  return (
    <Card
      title="Category averages"
      aside="across completed audits"
      className="lg:col-span-4"
    >
      <CategoryBars categories={s.categories} height={150} />
      <div className="mt-4 grid grid-cols-3 rounded-xl bg-muted/60 divide-x divide-border">
        {(["critical", "warning", "info"] as const).map((k) => (
          <div key={k} className="py-2.5 px-4 text-center">
            <div
              className={`font-heavy text-xl tabular-nums leading-none ${k === "critical" ? "text-danger" : k === "warning" ? "text-warning" : ""}`}
            >
              {issues[k]}
            </div>
            <div className="eyebrow text-[10px] mt-1 capitalize">{k}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Open issues across the latest audit of each domain.
      </p>
    </Card>
  );
}

function Recurring({ s }: { s: DashboardSummary }) {
  const max = Math.max(1, ...s.recurring.map((r) => r.count));
  return (
    <Card
      title="Recurring problems"
      aside={`${s.totals.domains} domain${s.totals.domains === 1 ? "" : "s"}`}
      className="lg:col-span-3"
    >
      {s.recurring.length ? (
        <ul className="space-y-2.5">
          {s.recurring.map((r) => (
            <li key={r.id} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums">
                  {r.count}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-danger/70"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No failed checks in your latest audits.
        </p>
      )}
    </Card>
  );
}

function Domains({ s }: { s: DashboardSummary }) {
  return (
    <Card
      title="Your domains"
      aside="latest audit per domain"
      className="lg:col-span-7"
    >
      {s.domains.length ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left eyebrow text-[10px]">
              <th className="font-semibold pb-2">Domain</th>
              <th className="font-semibold pb-2 text-right">Score</th>
              <th className="font-semibold pb-2 text-right hidden sm:table-cell">
                Change
              </th>
              <th className="font-semibold pb-2 text-right hidden sm:table-cell">
                Issues
              </th>
              <th className="font-semibold pb-2 text-right hidden md:table-cell">
                Audits
              </th>
              <th className="font-semibold pb-2 text-right">Last</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {s.domains.map((d) => (
              <tr key={d.domain} className="group">
                <td className="py-2.5 pr-3">
                  <Link
                    to={`/report/${d.latestId}`}
                    className="font-medium inline-flex items-center gap-1.5 hover:text-primary-dark"
                  >
                    {d.domain}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </td>
                <td
                  className={`py-2.5 text-right font-heavy tabular-nums ${scoreClass(d.latestScore)}`}
                >
                  {d.latestScore}
                </td>
                <td className="py-2.5 text-right hidden sm:table-cell">
                  <Delta value={d.change} />
                </td>
                <td className="py-2.5 text-right tabular-nums hidden sm:table-cell">
                  {d.openIssues}
                </td>
                <td className="py-2.5 text-right tabular-nums hidden md:table-cell text-muted-foreground">
                  {d.analyses}
                </td>
                <td className="py-2.5 text-right text-muted-foreground whitespace-nowrap">
                  {formatDate(d.lastAnalyzed, {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">
          Run an audit and your domains show up here with score trends.
        </p>
      )}
    </Card>
  );
}

function RankSnapshot({ s }: { s: DashboardSummary }) {
  const r = s.rank;
  const d = r.distribution;
  const total = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  const segs = [
    ["Top 3", d.top3, "#4c3fe0"],
    ["4–10", d.top10, "#6c5cf6"],
    ["11–20", d.top20, "#a297ff"],
    ["21–50", d.top50, "#d3ccff"],
    ["Not found", d.notFound, "#e8e8f3"],
  ] as const;
  const movers = [...r.movers.up.slice(0, 2), ...r.movers.down.slice(0, 2)];
  return (
    <Card
      title="Rank tracker"
      aside={
        <Link to="/rank-tracker" className="hover:text-foreground">
          Open →
        </Link>
      }
      className="lg:col-span-5"
    >
      {r.totals.tracked === 0 ? (
        <p className="text-sm text-muted-foreground">
          No keywords yet.{" "}
          <Link to="/rank-tracker" className="text-primary-dark font-semibold">
            Add your first keyword
          </Link>{" "}
          and we check it every morning.
        </p>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <span className="font-heavy text-4xl tracking-tight tabular-nums leading-none">
              {r.visibility}
            </span>
            <span className="text-muted-foreground text-sm mb-0.5">
              visibility
            </span>
            {r.visibilityChange !== null && (
              <Delta value={r.visibilityChange} />
            )}
            <span className="ml-auto text-sm text-muted-foreground">
              {r.totals.tracked} keywords
            </span>
          </div>
          <div className="mt-4 flex h-2.5 rounded-full overflow-hidden bg-muted">
            {segs.map(
              ([label, n, color]) =>
                n > 0 && (
                  <span
                    key={label}
                    title={`${label}: ${n}`}
                    style={{
                      width: `${(n / total) * 100}%`,
                      background: color,
                    }}
                  />
                ),
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {segs.map(([label, n, color]) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span
                  className="size-2 rounded-sm"
                  style={{ background: color }}
                />{" "}
                {label}{" "}
                <span className="font-semibold text-foreground">{n}</span>
              </span>
            ))}
          </div>
          {movers.length > 0 && (
            <ul className="mt-4 divide-y divide-border">
              {movers.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/rank/${m.id}`}
                    className="flex items-center justify-between py-2 text-sm hover:text-primary-dark"
                  >
                    <span className="truncate">
                      {m.country && (
                        <span className="mr-1.5">{flag(m.country)}</span>
                      )}
                      {m.keyword}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-heavy tabular-nums">
                        #{m.position}
                      </span>
                      <Delta value={m.change} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Skeleton className="h-64 lg:col-span-5 rounded-2xl!" />
      <Skeleton className="h-64 lg:col-span-4 rounded-2xl!" />
      <Skeleton className="h-64 lg:col-span-3 rounded-2xl!" />
    </div>
  );
}

export default function DashboardOverview({ s }: { s: DashboardSummary }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <ScoreOverTime s={s} />
      <Categories s={s} />
      <Recurring s={s} />
      <Domains s={s} />
      <RankSnapshot s={s} />
    </div>
  );
}
