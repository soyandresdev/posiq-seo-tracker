# RankPilot client

React 19 + Vite + Tailwind 4 + GSAP.

```bash
cp .env.example .env      # VITE_BACKEND_URL
npm install
npm run dev               # http://localhost:5173
npm run build             # type-check + production build
npm run lint
```

## Layout

- `src/pages` — one file per route
- `src/components/ui` — primitives: Button, Container, Reveal, Gauge, Logo
- `src/components/app` — product pieces: PageHeader, StatTile, UrlForm, AnalysisRow, RankChart…
- `src/components/home` — landing sections
- `src/lib/gsap.ts` — GSAP registration, shared eases and the scoped `useGsap` hook
- `src/index.css` — design tokens (fonts, colors, eases, display type scale) and both themes
- `src/types/api.ts` — API shapes, mirrored in `server/src/types/api.ts`

## Motion rules used here

- Only `transform` and `opacity` are animated, except deliberate height tweens on accordions.
- Landing: hero copy and product mockup animate on load; scroll reveals fire once and only on a few sections.
- Product pages: no scroll animation; entrances are short and interruptible.
- `prefers-reduced-motion` keeps fades and drops movement (see the end of `index.css` and `prefersReducedMotion()`).
