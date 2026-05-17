import { Container } from "../ui";

const stack = [
  "Browserbase",
  "Gemini",
  "Playwright",
  "MongoDB",
  "Express",
  "React",
];

export default function LogoStrip() {
  return (
    <section className="py-10 md:py-14">
      <Container className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <p className="text-sm text-muted-foreground max-w-[22ch] text-center md:text-left md:border-r md:border-border md:pr-10">
          Built on infrastructure you already trust.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {stack.map((s) => (
            <span
              key={s}
              className="px-5 py-2.5 rounded-full border border-border bg-card text-sm font-semibold text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
