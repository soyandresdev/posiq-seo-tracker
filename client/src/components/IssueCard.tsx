import { useRef, useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { gsap, useGsap, prefersReducedMotion } from "../lib/gsap";
import CopyButton from "./app/CopyButton";
import { isQuickWin } from "../lib/issues";
import type { Issue } from "../types/api";

const impactTone = { high: "text-danger", medium: "text-warning", low: "text-muted-foreground" } as const;
const effortLabel = { quick: "Quick fix", medium: "A few hours", large: "A project" } as const;

/** Accordion row. Height animates from its current state so rapid toggles never jump. */
export default function IssueCard({ issue, defaultOpen = false }: { issue: Issue; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const body = useRef<HTMLDivElement>(null);

    useGsap(() => {
        if (!body.current) return;
        gsap.to(body.current, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0, duration: prefersReducedMotion() ? 0.01 : 0.4, ease: "power4.out", overwrite: true });
    }, [open]);

    return (
        <div className="border-b border-border last:border-b-0">
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full grid grid-cols-[auto_1fr_auto] items-start gap-4 py-4 px-1 text-left">
                <span className={`severity-${issue.severity} mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize`}>{issue.severity}</span>
                <span className="min-w-0">
                    <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{issue.message}</span>
                        {isQuickWin(issue) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-lavender text-primary-dark px-2 py-0.5 text-[10px] font-semibold">
                                <Zap size={10} strokeWidth={3} /> Quick win
                            </span>
                        )}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                        {issue.category}
                        {issue.impact && (
                            <>
                                {" · "}
                                <span className={`font-semibold capitalize ${impactTone[issue.impact]}`}>{issue.impact} impact</span>
                            </>
                        )}
                        {issue.effort && <> · {effortLabel[issue.effort]}</>}
                    </span>
                </span>
                <ChevronDown size={16} className={`mt-1 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`} />
            </button>
            <div ref={body} className={`overflow-hidden ${defaultOpen ? "" : "h-0 opacity-0"}`}>
                <div className="pb-5 pl-[5.5rem] pr-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{issue.recommendation}</p>
                    {issue.snippet && (
                        <div className="relative rounded-xl bg-[#0f0f23] text-[#e8e8f3] p-4 pr-24 text-xs font-mono overflow-x-auto">
                            <CopyButton text={issue.snippet} className="absolute top-2.5 right-2.5 bg-white/10! border-white/10! text-white/80!" />
                            <pre className="whitespace-pre-wrap break-all">{issue.snippet}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
