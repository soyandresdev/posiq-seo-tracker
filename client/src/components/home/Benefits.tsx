import { useRef } from "react";
import { Container } from "../ui";
import SectionHeader from "./SectionHeader";
import { gsap, useGsap, prefersReducedMotion } from "../../lib/gsap";

const stats = [
  ["20", "automated checks on every audit, no AI guessing"],
  ["16", "countries to track positions in, per keyword"],
  ["30s", "from URL to a report with fixes to paste"],
  ["06:00", "daily position check, with an email if you drop"],
];

export default function Benefits() {
  const grid = useRef<HTMLDivElement>(null);
  useGsap(() => {
    if (!grid.current) return;
    gsap.from(grid.current.children, {
      autoAlpha: 0,
      y: prefersReducedMotion() ? 0 : 20,
      duration: 0.7,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: grid.current, start: "top 85%", once: true },
    });
  }, []);
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeader
          tag="Why Posiq"
          title={
            <>
              Built to help you <span className="text-primary">grow</span>
            </>
          }
          description="Sick of guessing why a page slipped? We measure, explain and watch it for you."
        />
        <div ref={grid} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, l], i) => (
            <div
              key={l}
              className={`card p-6 relative min-h-44 flex flex-col justify-between ${i % 2 === 0 ? "bg-gradient-to-b from-lavender/70 to-white" : ""}`}
            >
              <span
                className="absolute top-5 right-5 size-2 rounded-full bg-primary"
                aria-hidden
              />
              <div className="font-heavy text-display-lg tracking-tight leading-none">
                {n}
              </div>
              <p className="text-sm text-muted-foreground text-pretty">{l}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
