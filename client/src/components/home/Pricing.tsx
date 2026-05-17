import { Check } from "lucide-react";
import { Button, Container } from "../ui";

const free = [
  "5 analyses per day",
  "Full report with checklist and fixes",
  "10 assistant messages per report",
  "Rank tracking with email alerts",
];
const pro = [
  "Unlimited analyses",
  "200 assistant messages per report",
  "Unlimited keywords, bulk import",
  "Competitor and visibility reports",
  "Full rank history",
  "Report-ready emails",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <Container>
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[#7b6cff] p-6 md:p-12 text-white grid gap-10 lg:grid-cols-2 items-center shadow-float">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-white" /> Pricing
            </span>
            <h2 className="mt-5 font-display text-display-lg text-balance">
              Fair pricing. <span className="text-white/70">No surprises.</span>
            </h2>
            <p className="mt-4 text-white/80 max-w-[44ch] text-pretty">
              Start free with real limits, not a demo. Upgrade when your
              keywords outgrow the free plan.
            </p>
            <ul className="mt-8 space-y-2.5 text-sm">
              {free.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="size-5 rounded-full bg-white/20 grid place-items-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {f}
                  <span className="text-white/60">· Free</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-7 md:p-8 text-foreground">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg">Pro plan</div>
              <span className="rounded-full bg-lavender text-primary-dark px-2.5 py-1 text-xs font-semibold">
                Popular
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              For people who ship every week.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {pro.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="size-5 rounded-full bg-lavender text-primary-dark grid place-items-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-end justify-between gap-4 pt-6 border-t border-border">
              <div>
                <span className="font-heavy text-4xl tracking-tight">$19</span>
                <span className="text-muted-foreground text-sm"> /month</span>
              </div>
              <Button to="/register" variant="dark">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
