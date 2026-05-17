import { Bell, Check, Sparkles, X, Zap } from "lucide-react";
import { Container, Gauge, Reveal } from "../ui";
import SectionHeader from "./SectionHeader";
import { flag } from "../../lib/locales";

function Card({
  title,
  desc,
  children,
  className = "",
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`card p-6 flex flex-col ${className}`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{desc}</p>
      <div className="mt-6 flex-1 rounded-xl bg-gradient-to-b from-lavender/70 to-muted/40 border border-border/60 p-4 grid place-items-center min-h-40 overflow-hidden">
        {children}
      </div>
    </article>
  );
}

const checks = [
  ["Exactly one H1", true],
  ["Canonical URL set", true],
  ["Description under 160 characters", false],
  ["All images have alt text", false],
] as const;

const keywords = [
  ["seo rank tracker", "us", "#4", "+2"],
  ["auditoría seo", "es", "#7", "+1"],
  ["rank checker", "co", "#12", "-3"],
] as const;

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <Container>
        <SectionHeader
          tag="Features"
          title={
            <>
              Everything you need to{" "}
              <span className="text-primary">rank higher</span>
            </>
          }
          description="Real rendering, an AI editor, a daily watch on Google and an assistant that knows your report."
        />

        <Reveal stagger={0.07} y={20} className="grid gap-5 md:grid-cols-3">
          <Card
            title="Score and 20 checks"
            desc="One number per page, four category scores and a pass/fail checklist computed from the real DOM."
          >
            <div className="w-full flex items-center gap-4">
              <Gauge value={87} size={96} stroke={9} />
              <ul className="flex-1 space-y-1.5 text-xs">
                {checks.map(([label, ok]) => (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className={`size-4 rounded-full grid place-items-center shrink-0 ${ok ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}
                    >
                      {ok ? (
                        <Check size={9} strokeWidth={3.5} />
                      ) : (
                        <X size={9} strokeWidth={3.5} />
                      )}
                    </span>
                    <span
                      className={ok ? "text-muted-foreground" : "font-semibold"}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card
            title="Issues with a fix"
            desc="Every finding carries impact, effort and the exact tag to paste. Quick wins float to the top."
          >
            <div className="w-full space-y-2 text-xs">
              <div className="card px-3 py-2 flex items-center gap-2">
                <span className="severity-critical rounded-full px-2 py-0.5 font-semibold">
                  Critical
                </span>
                <span className="font-medium truncate">
                  7 images missing alt
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-lavender text-primary-dark px-2 py-0.5 text-[10px] font-semibold">
                  <Zap size={9} strokeWidth={3} /> Quick win
                </span>
              </div>
              <div className="rounded-lg bg-[#0f0f23] text-[#e8e8f3] p-2.5 font-mono text-[10px] leading-relaxed truncate">
                {
                  '<meta name="description" content="Payments infrastructure…" />'
                }
              </div>
            </div>
          </Card>

          <Card
            title="An assistant that read the report"
            desc="Ask what to fix first, get a meta description written to length, or alt text for the images. Grounded in your numbers."
          >
            <div className="w-full space-y-2 text-xs">
              <div className="flex justify-end">
                <span className="rounded-2xl rounded-br-md bg-primary text-white px-3 py-1.5">
                  What should I fix first?
                </span>
              </div>
              <div className="card p-3 leading-relaxed">
                <span className="inline-flex items-center gap-1 text-primary-dark font-semibold mb-1">
                  <Sparkles size={11} /> Assistant
                </span>
                <p>
                  Start with the <strong>7 images missing alt text</strong>:
                  critical, high impact, under 30 minutes. Then shorten the
                  description to 160 characters.
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Rank tracking in your market"
            desc="Pick country and language per keyword. Import a list, and every morning we log position, page and who sits above you."
            className="md:col-span-2"
          >
            <div className="w-full grid grid-cols-3 gap-3">
              {keywords.map(([k, c, p, d]) => (
                <div key={k} className="card p-3">
                  <div className="text-[11px] text-muted-foreground truncate">
                    <span className="mr-1">{flag(c)}</span>
                    {k}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-heavy text-xl tracking-tight">
                      {p}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${d.startsWith("+") ? "text-success" : "text-danger"}`}
                    >
                      {d}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Alerts when you slip"
            desc="An email when a keyword drops past your threshold or leaves the top 50, at most once a day per keyword."
          >
            <div className="w-full card p-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="size-6 rounded-full bg-lavender text-primary-dark grid place-items-center">
                  <Bell size={12} />
                </span>
                RankPilot · just now
              </div>
              <div className="mt-2 font-semibold">
                “ai seo audit” dropped to #17
              </div>
              <p className="mt-0.5 text-muted-foreground">
                rankpilot.app was #14 and is now #17. See the history →
              </p>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}
