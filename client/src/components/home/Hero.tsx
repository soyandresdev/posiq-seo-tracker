import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, Container, Reveal } from "../ui";
import ProductMockup from "./ProductMockup";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";

export default function Hero() {
    const mock = useRef<HTMLDivElement>(null);

    // The product rises into place after the copy
    useGsap(() => {
        if (!mock.current) return;
        const reduced = prefersReducedMotion();
        gsap.from(mock.current, { autoAlpha: 0, y: reduced ? 0 : 60, scale: reduced ? 1 : 0.97, duration: 1.1, ease: "expo.out", delay: 0.45 });
    }, []);

    return (
        <section className="hero-sky relative pt-36 pb-10 md:pt-44 overflow-hidden">
            <Container className="text-center">
                <Reveal immediate y={10} className="inline-flex items-center gap-2 rounded-full bg-card border border-border shadow-card px-3 py-1.5 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary text-white px-2 py-0.5">
                        <Sparkles size={11} /> New
                    </span>
                    Daily Google rank tracking
                </Reveal>
                <Reveal immediate delay={0.08} as="h1" className="mt-6 font-display text-display-xl text-balance mx-auto max-w-[18ch]">
                    Know where you rank. Fix what holds you <span className="text-primary">back.</span>
                </Reveal>
                <Reveal immediate delay={0.16} as="p" className="mt-5 text-muted-foreground text-lg max-w-[52ch] mx-auto text-pretty">
                    A real browser opens your page, Gemini grades it against 50+ factors, and every morning we check your positions on Google.
                </Reveal>
                <Reveal immediate delay={0.24} className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button to="/register" size="lg" icon={<ArrowRight size={16} />}>
                        Start for free
                    </Button>
                    <Button to="/login" size="lg" variant="secondary">
                        See a sample report
                    </Button>
                </Reveal>
                <Reveal immediate delay={0.3} y={0} as="p" className="mt-4 text-xs text-muted-foreground">
                    Free plan · 5 analyses a day · No credit card
                </Reveal>
            </Container>

            <Container size="wide" className="mt-14 md:mt-20 relative">
                <div ref={mock}>
                    <ProductMockup />
                </div>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
            </Container>
        </section>
    );
}
