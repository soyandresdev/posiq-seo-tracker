import { useRef } from "react";
import { Container, Gauge, Reveal } from "../ui";
import SectionHeader from "./SectionHeader";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";

function Card({ title, desc, children, className = "" }: { title: string; desc: string; children: React.ReactNode; className?: string }) {
    return (
        <article className={`card p-6 flex flex-col ${className}`}>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{desc}</p>
            <div className="mt-6 flex-1 rounded-xl bg-gradient-to-b from-lavender/70 to-muted/40 border border-border/60 p-4 grid place-items-center min-h-40 overflow-hidden">{children}</div>
        </article>
    );
}

const issues = [
    ["critical", "Missing H1"],
    ["warning", "10 images without alt"],
    ["info", "Canonical mismatch"],
] as const;
const keywords = [
    ["payments", 38],
    ["checkout", 21],
    ["revenue", 14],
    ["global", 9],
] as const;

export default function Features() {
    const bars = useRef<HTMLDivElement>(null);
    useGsap(() => {
        if (!bars.current) return;
        gsap.from(bars.current.querySelectorAll("[data-bar]"), { scaleY: 0, transformOrigin: "bottom", duration: prefersReducedMotion() ? 0.01 : 1, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: bars.current, start: "top 85%", once: true } });
    }, []);

    return (
        <section id="features" className="py-20 md:py-28">
            <Container>
                <SectionHeader tag="Features" title={<>Everything you need to <span className="text-primary">rank higher</span></>} description="Real rendering, an AI editor and a daily watch on Google, in one calm dashboard." />

                <Reveal stagger={0.07} y={20} className="grid gap-5 md:grid-cols-3">
                    <Card title="SEO score" desc="One number for the page, split into SEO, performance, accessibility and best practices.">
                        <Gauge value={87} size={120} stroke={10} label="stripe.com" />
                    </Card>

                    <Card title="Issues with a fix" desc="Every finding ranked by severity and paired with a recommendation you can hand off.">
                        <ul className="w-full space-y-2">
                            {issues.map(([s, t]) => (
                                <li key={t} className="card px-3 py-2 flex items-center gap-2 text-xs">
                                    <span className={`severity-${s} rounded-full px-2 py-0.5 font-semibold capitalize`}>{s}</span>
                                    <span className="font-medium truncate">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title="Keyword density" desc="Top terms, counts and density, so you know what the page actually says.">
                        <div ref={bars} className="w-full h-full flex items-end justify-around gap-3 px-2">
                            {keywords.map(([w, n]) => (
                                <div key={w} className="flex flex-col items-center gap-2 w-full">
                                    <div data-bar className="w-full rounded-md bg-primary/80" style={{ height: `${n * 3}px` }} />
                                    <span className="text-[10px] font-medium text-muted-foreground">{w}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Daily rank tracking" desc="Add keywords and we search Google every morning, logging position, page and competitors." className="md:col-span-2">
                        <div className="w-full grid grid-cols-3 gap-3">
                            {[
                                ["seo rank tracker", "#4", "+2"],
                                ["ai seo audit", "#17", "-3"],
                                ["google rank tracking", "#1", "0"],
                            ].map(([k, p, d]) => (
                                <div key={k} className="card p-3">
                                    <div className="text-[11px] text-muted-foreground truncate">{k}</div>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="font-heavy text-xl tracking-tight">{p}</span>
                                        <span className={`text-[11px] font-semibold ${d.startsWith("+") ? "text-success" : d.startsWith("-") ? "text-danger" : "text-muted-foreground"}`}>{d}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Real browser rendering" desc="Browserbase loads the page like a user would, so what we grade is what Google sees.">
                        <div className="w-full card overflow-hidden text-[10px]">
                            <div className="flex items-center gap-1.5 px-2 h-6 border-b border-border bg-muted/60">
                                <span className="size-1.5 rounded-full bg-[#ff5f57]" />
                                <span className="size-1.5 rounded-full bg-[#febc2e]" />
                                <span className="size-1.5 rounded-full bg-[#28c840]" />
                                <span className="ml-2 text-muted-foreground">https://yourdomain.com</span>
                            </div>
                            <div className="p-3 space-y-1.5">
                                <div className="h-2 w-2/3 rounded bg-foreground/80" />
                                <div className="h-1.5 w-full rounded bg-muted" />
                                <div className="h-1.5 w-5/6 rounded bg-muted" />
                                <div className="mt-2 flex gap-1.5">
                                    <span className="h-4 w-12 rounded bg-primary" />
                                    <span className="h-4 w-12 rounded bg-muted" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </Reveal>
            </Container>
        </section>
    );
}
