import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { axisTick } from "./theme";
import type { Analysis } from "../../types/api";

/** Heading counts per level. The H1 bar turns warning when there isn't exactly one. */
export default function HeadingChart({ headings, height = 200 }: { headings: Analysis["headings"]; height?: number }) {
    const data = (["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((l) => ({ level: l.toUpperCase(), count: headings[l] }));
    return (
        <div style={{ height }} role="img" aria-label="Heading structure">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={8}>
                    <XAxis type="number" hide allowDecimals={false} />
                    <YAxis type="category" dataKey="level" width={36} tick={axisTick} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{ fill: "var(--color-muted)", radius: 6 }}
                        content={({ active, payload }) => {
                            const p = payload?.[0]?.payload as { level: string; count: number } | undefined;
                            if (!active || !p) return null;
                            const note = p.level === "H1" ? (p.count === 1 ? "Ideal" : p.count === 0 ? "Missing" : "Should be exactly one") : undefined;
                            return <ChartTooltip title={p.level} rows={[{ label: note ?? "Count", value: p.count, color: "var(--color-primary)" }]} />;
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12} background={{ fill: "var(--color-muted)", radius: 4 }} animationDuration={900} animationEasing="ease-out">
                        {data.map((d) => (
                            <Cell key={d.level} fill={d.level === "H1" && d.count !== 1 ? "var(--color-warning)" : "var(--color-primary)"} />
                        ))}
                        <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 600, fill: "var(--color-foreground)" }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
