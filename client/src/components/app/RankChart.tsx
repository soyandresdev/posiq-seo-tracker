import { useMemo, useRef } from "react";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";
import { formatDate } from "../../lib/format";
import type { RankEntry } from "../../types/api";

type Props = { history: RankEntry[]; height?: number };

const PAD = { top: 16, right: 12, bottom: 28, left: 32 };
const W = 800;

/**
 * Position over time. Y is inverted: rank 1 sits at the top.
 * Line draws on mount; hover moves a guide via refs, no re-render per pixel.
 */
export default function RankChart({ history, height = 260 }: Props) {
    const svg = useRef<SVGSVGElement>(null);
    const line = useRef<SVGPathElement>(null);
    const area = useRef<SVGPathElement>(null);
    const guide = useRef<SVGLineElement>(null);
    const dot = useRef<SVGCircleElement>(null);
    const tip = useRef<HTMLDivElement>(null);

    const data = useMemo(() => history.filter((h) => h.position !== null).sort((a, b) => +new Date(a.date) - +new Date(b.date)), [history]);

    const { points, path, areaPath, yTicks, maxPos } = useMemo(() => {
        const H = height;
        const iw = W - PAD.left - PAD.right;
        const ih = H - PAD.top - PAD.bottom;
        const positions = data.map((d) => d.position as number);
        const maxPos = Math.max(10, ...positions);
        const x = (i: number) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * iw : iw / 2);
        const y = (p: number) => PAD.top + ((p - 1) / (maxPos - 1 || 1)) * ih;
        const points = data.map((d, i) => ({ x: x(i), y: y(d.position as number), d }));
        const path = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const areaPath = points.length ? `${path} L${points[points.length - 1].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${points[0].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z` : "";
        const step = maxPos <= 10 ? 3 : maxPos <= 30 ? 10 : 20;
        const yTicks = [1, ...Array.from({ length: Math.floor(maxPos / step) }, (_, i) => (i + 1) * step)].filter((v, i, a) => a.indexOf(v) === i && v <= maxPos).map((v) => ({ v, y: y(v) }));
        return { points, path, areaPath, yTicks, maxPos };
    }, [data, height]);

    useGsap(() => {
        if (!line.current || !area.current) return;
        const len = line.current.getTotalLength();
        const reduced = prefersReducedMotion();
        gsap.set(line.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.timeline()
            .to(line.current, { strokeDashoffset: 0, duration: reduced ? 0.01 : 1.4, ease: "power3.inOut" })
            .fromTo(area.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0.01 : 0.6 }, "-=0.5");
    }, [path]);

    const onMove = (e: React.MouseEvent) => {
        if (!svg.current || !points.length) return;
        const r = svg.current.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * W;
        let best = points[0];
        for (const p of points) if (Math.abs(p.x - mx) < Math.abs(best.x - mx)) best = p;
        guide.current?.setAttribute("x1", String(best.x));
        guide.current?.setAttribute("x2", String(best.x));
        dot.current?.setAttribute("cx", String(best.x));
        dot.current?.setAttribute("cy", String(best.y));
        if (tip.current) {
            tip.current.style.opacity = "1";
            tip.current.style.transform = `translate(${(best.x / W) * r.width}px, ${(best.y / height) * r.height}px)`;
            tip.current.innerHTML = `<span class="eyebrow">${formatDate(best.d.date, { day: "numeric", month: "short" })}</span><span class="font-heavy text-xl">#${best.d.position}</span>`;
        }
        guide.current?.setAttribute("opacity", "1");
        dot.current?.setAttribute("opacity", "1");
    };
    const onLeave = () => {
        guide.current?.setAttribute("opacity", "0");
        dot.current?.setAttribute("opacity", "0");
        if (tip.current) tip.current.style.opacity = "0";
    };

    if (!data.length) return <div className="h-40 grid place-items-center text-sm text-muted-foreground border-y border-border">No positions recorded yet.</div>;

    return (
        <div className="relative">
            <svg ref={svg} viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" onMouseMove={onMove} onMouseLeave={onLeave} role="img" aria-label={`Position history, best ${Math.min(...data.map((d) => d.position as number))}, worst ${maxPos}`}>
                <defs>
                    <linearGradient id="rank-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.2" />
                        <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {yTicks.map((t) => (
                    <g key={t.v}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="var(--color-border)" />
                        <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="var(--color-muted-foreground)" fontWeight="500">
                            {t.v}
                        </text>
                    </g>
                ))}
                {[0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i).map((i) => (
                    <text key={i} x={points[i].x} y={height - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="11" fill="var(--color-muted-foreground)" fontWeight="500">
                        {formatDate(data[i].date, { day: "numeric", month: "short" })}
                    </text>
                ))}
                <path ref={area} d={areaPath} fill="url(#rank-area)" opacity="0" />
                <path ref={line} d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <line ref={guide} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--color-primary)" strokeOpacity="0.4" strokeDasharray="3 3" opacity="0" />
                <circle ref={dot} r="4.5" fill="var(--background)" stroke="var(--color-primary)" strokeWidth="2.5" opacity="0" />
            </svg>
            <div ref={tip} aria-hidden className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 flex flex-col items-center gap-0.5 card px-3 py-1.5 opacity-0 transition-opacity duration-150" style={{ marginTop: -64 }} />
        </div>
    );
}
