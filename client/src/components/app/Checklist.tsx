import { useState } from "react";
import { Check as CheckIcon, X } from "lucide-react";
import type { Check } from "../../types/api";

const catLabel: Record<Check["category"], string> = { seo: "SEO", performance: "Performance", accessibility: "Accessibility", bestPractices: "Best practices" };
const order: Check["category"][] = ["seo", "bestPractices", "accessibility", "performance"];

/** Deterministic pass/fail checks grouped by category. */
export default function Checklist({ checks }: { checks: Check[] }) {
    const [onlyFailed, setOnlyFailed] = useState(false);
    const passed = checks.filter((c) => c.passed).length;
    const visible = onlyFailed ? checks.filter((c) => !c.passed) : checks;

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <span className="font-heavy text-2xl tracking-tight tabular-nums">
                        {passed}
                        <span className="text-muted-foreground font-medium text-base">/{checks.length}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">checks passed</span>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)} className="accent-[#6c5cf6]" />
                    Only failed
                </label>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-6">
                <div className="h-full rounded-full bg-success transition-[width] duration-700 ease-out-expo" style={{ width: `${(passed / Math.max(1, checks.length)) * 100}%` }} />
            </div>
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                {order.map((cat) => {
                    const items = visible.filter((c) => c.category === cat);
                    if (!items.length) return null;
                    return (
                        <div key={cat}>
                            <div className="eyebrow mb-2">{catLabel[cat]}</div>
                            <ul className="space-y-1.5">
                                {items.map((c) => (
                                    <li key={c.id} className="flex items-start gap-2.5 text-sm">
                                        <span className={`mt-0.5 size-4 rounded-full grid place-items-center shrink-0 ${c.passed ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>{c.passed ? <CheckIcon size={10} strokeWidth={3.5} /> : <X size={10} strokeWidth={3.5} />}</span>
                                        <span className="min-w-0">
                                            <span className={c.passed ? "" : "font-semibold"}>{c.label}</span>
                                            <span className="block text-xs text-muted-foreground truncate">{c.detail}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
