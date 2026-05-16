import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { axisTick } from "./theme";
import { scoreLabel, scoreTone } from "../../lib/score";
import type { Categories } from "../../types/api";

const names: [keyof Categories, string][] = [
    ["seo", "SEO"],
    ["performance", "Performance"],
    ["accessibility", "Accessibility"],
    ["bestPractices", "Best practices"],
];

/** Horizontal score bars, colored by status, value in text ink. */
export default function CategoryBars({ categories, height = 168 }: { categories: Categories; height?: number }) {
    const data = names.map(([k, name]) => ({ name, value: categories[k] }));
    return (
        <div style={{ height }} role="img" aria-label="Scores by category">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barCategoryGap={10}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" width={104} tick={axisTick} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{ fill: "var(--color-muted)", radius: 6 }}
                        content={({ active, payload }) => {
                            const p = payload?.[0]?.payload as { name: string; value: number } | undefined;
                            if (!active || !p) return null;
                            return <ChartTooltip title={p.name} rows={[{ label: scoreLabel(p.value), value: `${p.value} / 100`, color: scoreTone(p.value) }]} />;
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10} background={{ fill: "var(--color-muted)", radius: 4 }} animationDuration={900} animationEasing="ease-out">
                        {data.map((d) => (
                            <Cell key={d.name} fill={scoreTone(d.value)} />
                        ))}
                        <LabelList dataKey="value" position="right" style={{ fontSize: 12, fontWeight: 600, fill: "var(--color-foreground)" }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
