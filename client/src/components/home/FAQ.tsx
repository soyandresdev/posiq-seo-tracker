import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "../ui";
import SectionHeader from "./SectionHeader";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";

const faqs = [
    ["How is the score calculated?", "A cloud browser renders your page and we read title, meta, headings, links and images from the live DOM. Gemini grades those facts against a strict schema and returns four category scores plus issues."],
    ["Is the free plan really free?", "Yes. Five analyses a day and rank tracking for three keywords, no card required."],
    ["How often are positions checked?", "Every morning at 06:00 server time. You can also refresh any keyword by hand."],
    ["Which Google is searched?", "google.com with English results and US location, scanning up to five pages of ten results."],
    ["Can I delete my data?", "Any analysis or keyword can be deleted from its page. Deletion is immediate."],
    ["Does it work on password-protected pages?", "No. The page must be reachable by a normal browser without logging in."],
];

function Item({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    const body = useRef<HTMLDivElement>(null);
    useGsap(() => {
        if (!body.current) return;
        gsap.to(body.current, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0, duration: prefersReducedMotion() ? 0.01 : 0.4, ease: "power4.out", overwrite: true });
    }, [open]);
    return (
        <div className="card">
            <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 p-4 text-left text-sm font-semibold">
                {q}
                <Plus size={16} className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-45" : ""}`} />
            </button>
            <div ref={body} className="overflow-hidden h-0 opacity-0">
                <p className="px-4 pb-4 text-sm text-muted-foreground text-pretty">{a}</p>
            </div>
        </div>
    );
}

export default function FAQ() {
    return (
        <section className="py-20 md:py-28">
            <Container>
                <SectionHeader tag="FAQs" title={<>Curated <span className="text-primary">questions</span></>} description="Short answers. Ask us anything else." />
                <div className="grid gap-3 md:grid-cols-2">
                    {faqs.map(([q, a]) => (
                        <Item key={q} q={q} a={a} />
                    ))}
                </div>
            </Container>
        </section>
    );
}
