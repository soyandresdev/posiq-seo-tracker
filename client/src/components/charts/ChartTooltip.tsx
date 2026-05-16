import type { ReactNode } from "react";

/** Shared tooltip surface: card, small type, text in text tokens. */
export default function ChartTooltip({ title, rows }: { title?: ReactNode; rows: { label: ReactNode; value: ReactNode; color?: string }[] }) {
    return (
        <div className="card px-3 py-2 text-xs shadow-soft min-w-32">
            {title && <div className="text-muted-foreground mb-1">{title}</div>}
            {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} />}
                        {r.label}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">{r.value}</span>
                </div>
            ))}
        </div>
    );
}

