import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, useGsap, prefersReducedMotion } from "../lib/gsap";
import type { Issue } from "../types/api";

/** Accordion row. Height animates from its current state so rapid toggles never jump. */
export default function IssueCard({ issue }: { issue: Issue }) {
    const [open, setOpen] = useState(false);
    const body = useRef<HTMLDivElement>(null);
    useGsap(() => {
        if (!body.current) return;
        gsap.to(body.current, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0, duration: prefersReducedMotion() ? 0.01 : 0.4, ease: "power4.out", overwrite: true });
    }, [open]);
    return (
        <div className="border-b border-border last:border-b-0">
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full grid grid-cols-[auto_1fr_auto] items-start gap-4 py-4 px-1 text-left">
                <span className={`severity-${issue.severity} mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize`}>{issue.severity}</span>
                <span>
                    <span className="block text-sm font-semibold">{issue.message}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{issue.category}</span>
                </span>
                <ChevronDown size={16} className={`mt-1 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`} />
            </button>
            <div ref={body} className="overflow-hidden h-0 opacity-0">
                <p className="pb-5 pl-[5.5rem] pr-8 text-sm text-muted-foreground leading-relaxed text-pretty">{issue.recommendation}</p>
            </div>
        </div>
    );
}
