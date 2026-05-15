import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Container, Button } from "../components/ui";
import UrlForm from "../components/app/UrlForm";
import { gsap, useGsap, prefersReducedMotion } from "../lib/gsap";
import { hostnameOf, normalizeUrl } from "../types/api";

const STEPS = [
    { label: "Opening a cloud browser", desc: "A Browserbase session with ads blocked." },
    { label: "Rendering the page", desc: "Reading title, meta, headings, links and images from the live DOM." },
    { label: "Gemini is scoring it", desc: "Strict schema: scores, keywords, issues with recommendations." },
    { label: "Report ready", desc: "Taking you there." },
];

const POLL_MS = 2000;
const MAX_ATTEMPTS = 60;

export default function Analyze() {
    const { api } = useApp();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const prefill = params.get("url") ?? "";

    const [target, setTarget] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const poll = useRef<ReturnType<typeof setInterval> | null>(null);

    const stop = () => {
        if (poll.current) clearInterval(poll.current);
        poll.current = null;
    };

    const start = async (raw: string) => {
        const url = normalizeUrl(raw);
        setError(null);
        setTarget(url);
        setStep(0);
        try {
            const { data } = await api.post("/api/analysis/analyze", { url });
            if (!data.success) throw new Error(data.message);
            const id: string = data.analysisId;
            setStep(1);

            let attempts = 0;
            stop();
            poll.current = setInterval(async () => {
                attempts += 1;
                if (attempts > MAX_ATTEMPTS) {
                    stop();
                    setError("This is taking longer than expected. Check History in a minute.");
                    setTarget(null);
                    return;
                }
                try {
                    const check = await api.get(`/api/analysis/${id}`);
                    const status = check.data.analysis?.status;
                    if (status === "completed") {
                        stop();
                        setStep(3);
                        setTimeout(() => navigate(`/report/${id}`), 900);
                    } else if (status === "failed") {
                        stop();
                        setError("The analysis failed. The site may block bots or the model was unavailable.");
                        setTarget(null);
                    } else if (attempts > 5) {
                        setStep(2);
                    }
                } catch {
                    /* transient polling error */
                }
            }, POLL_MS);
        } catch (err) {
            const msg = axios.isAxiosError(err) ? ((err.response?.data as { message?: string })?.message ?? err.message) : err instanceof Error ? err.message : "Failed to start";
            setError(msg);
            setTarget(null);
        }
    };

    // Auto-start when arriving with ?url=
    useEffect(() => {
        if (!prefill) return;
        const t = setTimeout(() => start(prefill), 250);
        return () => {
            clearTimeout(t);
            stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefill]);

    return (
        <Container as="main" className="pt-28 pb-24">
            {target ? <Progress url={target} step={step} /> : <Idle initial={prefill} error={error} onSubmit={start} />}
        </Container>
    );
}

function Idle({ initial, error, onSubmit }: { initial: string; error: string | null; onSubmit: (u: string) => void }) {
    const examples = ["stripe.com", "vercel.com", "github.com"];
    return (
        <div className="max-w-2xl mx-auto pt-6 md:pt-14">
            <div className="eyebrow mb-2 text-primary-dark">Analyze</div>
            <h1 className="font-display text-display-lg text-balance">What should we look at?</h1>
            <p className="mt-4 text-muted-foreground max-w-[46ch] text-pretty">Any public page. A real browser renders it, Gemini scores it, you get a report in about thirty seconds.</p>

            <UrlForm key={initial} initial={initial} onSubmit={onSubmit} autoFocus size="lg" className="mt-10" />

            {error && (
                <p role="alert" className="mt-4 text-sm text-danger">
                    {error}
                </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                Try
                {examples.map((e) => (
                    <Button key={e} variant="secondary" size="sm" onClick={() => onSubmit(e)}>
                        {e}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function Progress({ url, step }: { url: string; step: number }) {
    const line = useRef<HTMLDivElement>(null);

    // Progress line grows to the active step. Interruptible: always from current state.
    useGsap(() => {
        if (!line.current) return;
        gsap.to(line.current, { scaleY: step / (STEPS.length - 1), duration: prefersReducedMotion() ? 0.01 : 0.8, ease: "expo.out", overwrite: true });
    }, [step]);

    return (
        <div className="max-w-2xl mx-auto pt-6 md:pt-14">
            <div className="eyebrow mb-2 text-primary-dark">Analyzing</div>
            <h1 className="font-display text-display-lg break-all">{hostnameOf(url)}</h1>
            <p className="mt-3 text-muted-foreground text-sm truncate">{url}</p>

            <ol className="relative mt-10 card p-6 pl-8 space-y-0">
                <div aria-hidden className="absolute left-[33px] top-9 bottom-9 w-0.5 bg-border" />
                <div ref={line} aria-hidden className="absolute left-[33px] top-9 bottom-9 w-0.5 bg-primary origin-top scale-y-0" />
                {STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                        <li key={s.label} className={`relative pl-9 py-4 transition-opacity duration-500 ${i > step ? "opacity-40" : "opacity-100"}`}>
                            <span className={`absolute left-0 top-[26px] size-[19px] border-2 grid place-items-center transition-colors duration-300 `}>
                                {done && <Check size={9} strokeWidth={3} />}
                                {active && <span className="size-2 rounded-full bg-primary animate-pulse" />}
                            </span>
                            <div className="font-semibold">{s.label}</div>
                            <div className="text-sm text-muted-foreground">{s.desc}</div>
                        </li>
                    );
                })}
            </ol>

            <p className="mt-10 text-xs text-muted-foreground">Usually 15 to 30 seconds. You can leave; the result lands in History.</p>
        </div>
    );
}
