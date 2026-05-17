import { Container, Logo } from "../ui";
import { homefooterLinks } from "../../assets/content";

export default function Footer() {
  return (
    <footer className="pt-12 pb-6 overflow-hidden border-t border-border bg-card">
      <Container>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-[30ch] text-pretty">
              AI SEO audits and daily Google rank tracking, in one calm
              dashboard.
            </p>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {homefooterLinks.map((s) => (
              <div key={s.title}>
                <div className="text-sm font-semibold mb-3">{s.title}</div>
                <ul className="space-y-2">
                  {s.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="mt-12 -mb-[0.28em] text-center font-heavy leading-none text-[18vw] tracking-tighter text-foreground/[0.04] select-none whitespace-nowrap"
        >
          RankPilot
        </div>
        <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} RankPilot. All rights reserved.
          </span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-success" /> All systems
            operational
          </span>
        </div>
      </Container>
    </footer>
  );
}
