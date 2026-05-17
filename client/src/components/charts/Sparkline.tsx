import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

/** Tiny 14-day trend. Reversed axis so up means better. Nulls (not found) break the line. */
export default function Sparkline({ values, width = 96, height = 28 }: { values: (number | null)[]; width?: number; height?: number }) {
    if (values.filter((v) => v !== null).length < 2) return <span className="inline-block" style={{ width, height }} aria-hidden />;
    const data = values.map((v, i) => ({ i, v }));
    const nums = values.filter((v): v is number => v !== null);
    const first = nums[0] ?? 0;
    const last = nums[nums.length - 1] ?? 0;
    const tone = last < first ? "var(--color-success)" : last > first ? "var(--color-danger)" : "var(--color-muted-foreground)";
    return (
        <div style={{ width, height }} role="img" aria-label={`Trend from #${first} to #${last}`}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 3, right: 2, bottom: 3, left: 2 }}>
                    <YAxis reversed hide domain={["dataMin", "dataMax"]} />
                    <Line type="monotone" dataKey="v" stroke={tone} strokeWidth={1.75} dot={false} isAnimationActive={false} connectNulls={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
