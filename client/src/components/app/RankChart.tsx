import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "../charts/ChartTooltip";
import { axisTick, gridStroke } from "../charts/theme";
import { formatDate } from "../../lib/format";
import type { RankEntry } from "../../types/api";

type Props = { history: RankEntry[]; height?: number };
type Point = { t: number; label: string; position: number; page: number | null };

/** Position over time. Y is reversed so rank 1 sits at the top. */
export default function RankChart({ history, height = 260 }: Props) {
    const data = useMemo<Point[]>(
        () =>
            history
                .filter((h) => h.position !== null)
                .sort((a, b) => +new Date(a.date) - +new Date(b.date))
                .map((h) => ({ t: +new Date(h.date), label: formatDate(h.date, { day: "numeric", month: "short" }), position: h.position as number, page: h.page })),
        [history]
    );

    if (!data.length) return <div className="h-40 grid place-items-center text-sm text-muted-foreground rounded-xl bg-muted/50">No positions recorded yet.</div>;

    const maxPos = Math.max(10, ...data.map((d) => d.position));
    const step = maxPos <= 10 ? 3 : maxPos <= 30 ? 10 : 20;
    const ticks = [1, ...Array.from({ length: Math.floor(maxPos / step) }, (_, i) => (i + 1) * step)].filter((v, i, a) => a.indexOf(v) === i);
    const best = Math.min(...data.map((d) => d.position));

    return (
        <div style={{ height }} role="img" aria-label={`Position history, best ${best}, worst ${maxPos}`}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="rank-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={40} />
                    <YAxis reversed domain={[1, maxPos]} ticks={ticks} interval={0} tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={40} tickFormatter={(v: number) => `#${v}`} />
                    <Tooltip
                        cursor={{ stroke: "var(--color-primary)", strokeDasharray: "3 3", strokeOpacity: 0.5 }}
                        content={({ active, payload }) => {
                            const p = payload?.[0]?.payload as Point | undefined;
                            if (!active || !p) return null;
                            return <ChartTooltip title={formatDate(new Date(p.t).toISOString(), { weekday: "short", day: "numeric", month: "short" })} rows={[{ label: "Position", value: `#${p.position}`, color: "var(--color-primary)" }, ...(p.page ? [{ label: "Page", value: p.page }] : [])]} />;
                        }}
                    />
                    <Area type="monotone" dataKey="position" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rank-fill)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "var(--color-primary)" }} animationDuration={900} animationEasing="ease-out" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
