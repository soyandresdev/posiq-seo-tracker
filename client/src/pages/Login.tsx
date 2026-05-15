import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Button, Gauge, Logo } from "../components/ui";
import { gsap, useGsap, prefersReducedMotion, ease } from "../lib/gsap";

type Mode = "login" | "register";

const copy: Record<Mode, { title: string; sub: string; cta: string; switchLabel: string; switchCta: string; switchTo: string }> = {
    login: { title: "Welcome back", sub: "Sign in to see this morning's positions.", cta: "Sign in", switchLabel: "New here?", switchCta: "Create an account", switchTo: "/register" },
    register: { title: "Create your account", sub: "Free plan. Five analyses a day. No card.", cta: "Create account", switchLabel: "Already have an account?", switchCta: "Sign in", switchTo: "/login" },
};

export default function Login({ state }: { state: Mode }) {
    const mode: Mode = state;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorState, setErrorState] = useState<{ mode: Mode; msg: string } | null>(null);
    const error = errorState?.mode === mode ? errorState.msg : null;
    const setError = (msg: string | null) => setErrorState(msg ? { mode, msg } : null);
    const { login, register } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const root = useRef<HTMLDivElement>(null);
    const nameWrap = useRef<HTMLDivElement>(null);
    const form = useRef<HTMLFormElement>(null);

    useGsap(() => {
        if (!root.current) return;
        gsap.from(root.current.querySelectorAll("[data-intro]"), { autoAlpha: 0, y: prefersReducedMotion() ? 0 : 16, duration: 0.7, ease: ease.outExpo, stagger: 0.06 });
    }, []);

    useGsap(() => {
        const el = nameWrap.current;
        if (!el) return;
        const show = mode === "register";
        gsap.to(el, { height: show ? "auto" : 0, autoAlpha: show ? 1 : 0, duration: 0.45, ease: ease.outQuart, overwrite: true });
    }, [mode]);

    const shake = () => {
        if (!form.current || prefersReducedMotion()) return;
        gsap.fromTo(form.current, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = mode === "login" ? await login(email, password) : await register(name, email, password);
        setLoading(false);
        if (result.success) {
            navigate(searchParams.get("redirect") || "/dashboard");
            return;
        }
        const msg = result.message || "Something went wrong";
        setError(msg);
        toast.error(msg);
        shake();
    };

    const c = copy[mode];
    const redirect = searchParams.get("redirect");

    return (
        <div ref={root} className="min-h-screen hero-sky grid lg:grid-cols-2">
            <aside className="relative hidden lg:flex flex-col justify-between p-12">
                <div data-intro>
                    <Logo />
                </div>
                <div data-intro className="card p-6 max-w-md shadow-float">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="eyebrow">stripe.com</div>
                            <div className="font-semibold mt-0.5">Overall score</div>
                        </div>
                        <Gauge value={91} size={96} stroke={9} trigger="mount" />
                    </div>
                    <ul className="mt-5 space-y-2 text-sm">
                        {[
                            ["seo rank tracker", "#4", "+2"],
                            ["ai seo audit", "#17", "-3"],
                        ].map(([k, p, d]) => (
                            <li key={k} className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-heavy">
                                    {p} <span className={`text-xs ${d.startsWith("+") ? "text-success" : "text-danger"}`}>{d}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p data-intro className="font-display text-display-md text-balance max-w-[18ch]">
                    The page you shipped is not the page Google sees.
                </p>
            </aside>

            <main className="flex flex-col px-5 sm:px-12 py-8">
                <div data-intro className="flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <ArrowLeft size={15} /> Back
                    </Link>
                    <div className="lg:hidden">
                        <Logo />
                    </div>
                </div>

                <div className="my-auto w-full max-w-md mx-auto py-16">
                    <div data-intro className="card p-7 md:p-8 shadow-soft">
                        <h1 className="font-display text-display-md">{c.title}</h1>
                        <p className="mt-2 text-muted-foreground">{c.sub}</p>

                        <form ref={form} onSubmit={submit} className="mt-8 space-y-4" noValidate>
                            <div ref={nameWrap} className="overflow-hidden" style={{ height: mode === "register" ? "auto" : 0, opacity: mode === "register" ? 1 : 0 }} aria-hidden={mode !== "register"}>
                                <Field label="Name" id="name" type="text" value={name} onChange={setName} autoComplete="name" required={mode === "register"} disabled={mode !== "register"} className="pb-4" />
                            </div>
                            <Field label="Email" id="email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
                            <Field label="Password" id="password" type="password" value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} />

                            <div aria-live="polite" className="min-h-5 text-sm text-danger">
                                {error}
                            </div>

                            <Button type="submit" size="lg" loading={loading} icon={<ArrowRight size={16} />} className="w-full">
                                {c.cta}
                            </Button>
                        </form>
                    </div>

                    <p data-intro className="mt-6 text-center text-sm text-muted-foreground">
                        {c.switchLabel}{" "}
                        <Link to={c.switchTo + (redirect ? `?redirect=${encodeURIComponent(redirect)}` : "")} className="text-primary-dark font-semibold hover:underline underline-offset-4">
                            {c.switchCta}
                        </Link>
                    </p>
                </div>

                <p data-intro className="text-xs text-muted-foreground text-center">
                    By continuing you agree to the Terms and Privacy Policy.
                </p>
            </main>
        </div>
    );
}

type FieldProps = { label: string; id: string; type: string; value: string; onChange: (v: string) => void; autoComplete?: string; required?: boolean; disabled?: boolean; minLength?: number; className?: string };

function Field({ label, id, type, value, onChange, autoComplete, required, disabled, minLength, className = "" }: FieldProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-semibold mb-1.5">
                {label}
            </label>
            <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required={required} disabled={disabled} minLength={minLength} className="w-full h-11 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-[border-color,box-shadow] duration-150" />
        </div>
    );
}
