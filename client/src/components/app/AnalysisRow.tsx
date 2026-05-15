import { ArrowUpRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Gauge } from "../ui";
import { scoreClass } from "../../lib/score";
import { hostnameOf, type AnalysisSummary } from "../../types/api";

type Props = { analysis: AnalysisSummary; onDelete?: (id: string) => Promise<void> | void };
const cats: [keyof AnalysisSummary["categories"], string][] = [["seo", "SEO"], ["performance", "Perf"], ["accessibility", "A11y"], ["bestPractices", "BP"]];

/** One analysis as a card row. Two-tap delete, no confirm() dialog. */
export default function AnalysisRow({ analysis: a, onDelete }: Props) {
    const [armed, setArmed] = useState(false);
    const [busy, setBusy] = useState(false);
    const done = a.status === "completed";
    const del = async () => {
        if (!onDelete) return;
        if (!armed) {
            setArmed(true);
            setTimeout(() => setArmed(false), 3000);
            return;
        }
        setBusy(true);
        await onDelete(a._id);
    };
    return (
        <div className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 md:gap-6 p-4 md:px-5 transition-colors duration-150 hover:bg-lavender/30">
            <Link to={`/report/${a._id}`} className="shrink-0" aria-label={`Open report for ${hostnameOf(a.url)}`}>
                {done ? <Gauge value={a.overallScore} size={52} stroke={5} trigger="mount" /> : <span className={`size-[52px] rounded-full grid place-items-center text-[10px] font-bold uppercase ${a.status === "failed" ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"}`}>{a.status === "failed" ? "err" : <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}</span>}
            </Link>
            <Link to={`/report/${a._id}`} className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{hostnameOf(a.url)}</span>
                    <ArrowUpRight size={14} className="shrink-0 text-primary opacity-0 -translate-x-1 transition-[opacity,transform] duration-300 ease-out-expo group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <div className="text-xs text-muted-foreground truncate">
                    {new Date(a.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · {a.url}
                </div>
            </Link>
            <div className="hidden md:flex items-end gap-5">
                {done &&
                    cats.map(([k, label]) => (
                        <div key={k} className="text-right w-10">
                            <div className={`font-heavy text-sm tabular-nums ${scoreClass(a.categories[k])}`}>{a.categories[k]}</div>
                            <div className="eyebrow text-[10px]">{label}</div>
                        </div>
                    ))}
            </div>
            {onDelete ? (
                <button onClick={del} disabled={busy} aria-label={armed ? "Confirm delete" : "Delete analysis"} className={`h-9 rounded-full grid place-items-center text-xs font-semibold transition-[background-color,color] duration-200 pressable ${armed ? "px-3 bg-danger text-white" : "w-9 text-muted-foreground hover:text-danger hover:bg-danger/10"}`}>
                    {busy ? <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : armed ? "Confirm" : <Trash2 size={15} />}
                </button>
            ) : (
                <span />
            )}
        </div>
    );
}
