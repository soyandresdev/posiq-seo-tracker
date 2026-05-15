import { useRef } from "react";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";

type Props = { label: string; value: number | string; hint?: string; tone?: string; accent?: "blue" | "orange" | "none" };

/** White stat card with a violet dot. Numbers count up once on mount. */
export default function StatTile({ label, value, hint, tone, accent = "none" }: Props) {
    const num = useRef<HTMLSpanElement>(null);
    const isNumber = typeof value === "number";
    useGsap(() => {
        if (!isNumber || !num.current) return;
        if (prefersReducedMotion()) {
            num.current.textContent = String(value);
            return;
        }
        const o = { v: 0 };
        gsap.to(o, { v: value, duration: 0.9, ease: "expo.out", onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(o.v)); } });
    }, [value]);
    const highlight = accent !== "none";
    return (
        <div className={`card p-5 relative overflow-hidden ${highlight ? "bg-gradient-to-br from-lavender to-white" : ""}`}>
            <span className="absolute top-4 right-4 size-2 rounded-full bg-primary" aria-hidden />
            <div className="eyebrow">{label}</div>
            <div className="mt-3 font-heavy text-display-md tabular-nums leading-none tracking-tight" style={tone ? { color: tone } : undefined}>
                {isNumber ? <span ref={num}>0</span> : value}
            </div>
            {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
        </div>
    );
}
