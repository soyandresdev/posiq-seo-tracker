import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { axisTick, gridStroke } from "./theme";
import type { Keyword } from "../../types/api";

/** Keyword frequency, single hue. Tooltip carries count and density. */
export default function KeywordChart({ keywords, limit = 10, height = 220 }: { keywords: Keyword[]; limit?: number; height?: number }) {
    const data = keywords.slice(0, limit);
    if (!data.length) return <p className="text-sm text-muted-foreground">No keywords extracted.</p>;
    return (
        <div style={{ height }} role="img" aria-label="Top keywords by frequency">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="word" tick={axisTick} tickLine={false} axisLine={false} interval={0} angle={data.length > 6 ? -25 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 48 : 24} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                        cursor={{ fill: "var(--color-muted)", radius: 6 }}
                        content={({ active, payload }) => {
                            const p = payload?.[0]?.payload as Keyword | undefined;
                            if (!active || !p) return null;
                            return <ChartTooltip title={p.word} rows={[{ label: "Occurrences", value: `${p.count}×`, color: "var(--color-primary)" }, { label: "Density", value: `${p.density.toFixed(1)}%` }]} />;
                        }}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} animationEasing="ease-out" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
