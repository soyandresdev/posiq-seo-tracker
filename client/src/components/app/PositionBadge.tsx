import { ArrowDown, ArrowUp, Minus } from "lucide-react";

/** Current position with change chip. Positive change = moved up. */
export default function PositionBadge({ position, change, size = "md" }: { position: number | null; change: number; size?: "md" | "lg" }) {
    const num = size === "lg" ? "text-display-lg" : "text-display-sm";
    if (position === null) return <span className={`font-heavy ${num} text-muted-foreground leading-none`}>—</span>;
    const chip = change > 0 ? "bg-success/10 text-success" : change < 0 ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground";
    const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;
    return (
        <span className="inline-flex items-center gap-2">
            <span className={`font-heavy ${num} tabular-nums leading-none tracking-tight`}>#{position}</span>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${chip}`}>
                <Icon size={11} strokeWidth={3} />
                {Math.abs(change)}
            </span>
        </span>
    );
}
