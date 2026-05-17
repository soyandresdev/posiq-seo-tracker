import { Check } from "lucide-react";
import { Container, Reveal } from "../ui";
import SectionHeader from "./SectionHeader";

const steps = [
  {
    title: "Paste a URL",
    desc: "Any public page. We normalize it, create the report and get to work in the background.",
  },
  {
    title: "We render, check and grade it",
    desc: "A cloud browser loads the page, 20 checks run on the live DOM, and Gemini turns the facts into scores, prioritized issues and a summary.",
  },
  {
    title: "Track, ask, get alerted",
    desc: "Import your keywords with country and language. Ask the assistant what to fix. Get an email when a position drops.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-28">
      <Container>
        <SectionHeader
          tag="How it works"
          title={
            <>
              Get started in <span className="text-primary">3 easy steps</span>
            </>
          }
          description="Guided from the first URL to a daily report. Most of it runs on its own."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] items-stretch">
          <Reveal className="card overflow-hidden bg-gradient-to-br from-primary to-[#8b7cff] p-8 text-white min-h-80 flex flex-col justify-end relative">
            <div className="absolute inset-x-8 top-8 card p-4 text-foreground shadow-float">
              <div className="eyebrow">Analyzing</div>
              <div className="mt-1 font-semibold">stripe.com</div>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  "Opening a cloud browser",
                  "Rendering the page",
                  "Gemini is scoring it",
                ].map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className={`size-4 rounded-full grid place-items-center ${i < 2 ? "bg-primary text-white" : "border border-border"}`}
                    >
                      {i < 2 && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className={i < 2 ? "" : "text-muted-foreground"}>
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative font-display text-display-sm max-w-[18ch]">
              From URL to a report in about thirty seconds.
            </p>
          </Reveal>
          <Reveal stagger={0.08} className="grid gap-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="card p-6 flex gap-5 relative overflow-hidden"
              >
                <span
                  aria-hidden
                  className="absolute -top-3 right-4 font-heavy text-7xl text-foreground/[0.05] tracking-tighter"
                >
                  0{i + 1}
                </span>
                <span className="size-10 shrink-0 rounded-full bg-primary text-white grid place-items-center font-bold text-sm shadow-primary">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
