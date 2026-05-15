import { useRef } from "react";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";
import { scoreTone } from "../../lib/score";

type Props = { value: number; size?: number; stroke?: number; label?: string; trigger?: "scroll" | "mount"; className?: string };

/** Circular score gauge. Arc draws with stroke-dashoffset, number counts up. */
export default function Gauge({ value, size = 160, stroke = 10, label, trigger = "scroll", className = "" }: Props) {
    const arc = useRef<SVGCircleElement>(null);
    const num = useRef<HTMLSpanElement>(null);
    const wrap = useRef<HTMLDivElement>(null);
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const target = Math.max(0, Math.min(100, value));

    useGsap(() => {
        if (!arc.current || !num.current || !wrap.current) return;
        const reduced = prefersReducedMotion();
        const counter = { v: 0 };
        const tl = gsap.timeline({ defaults: { duration: reduced ? 0.01 : 1.4, ease: "expo.out" }, ...(trigger === "scroll" ? { scrollTrigger: { trigger: wrap.current, start: "top 80%", once: true } } : {}) });
        tl.fromTo(arc.current, { strokeDashoffset: c }, { strokeDashoffset: c * (1 - target / 100) }, 0).to(counter, { v: target, onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(counter.v)); } }, 0);
    }, [target]);

    return (
        <div ref={wrap} className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Score"} ${target} out of 100`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
                <circle ref={arc} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreTone(target)} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c} />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                    <span ref={num} className="font-heavy leading-none tabular-nums tracking-tight" style={{ fontSize: size * 0.28 }}>0</span>
                    {label && <div className="eyebrow mt-1">{label}</div>}
                </div>
            </div>
        </div>
    );
}
