import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button, Container, Logo } from "./ui";
import { gsap, useGsap, prefersReducedMotion, ease } from "../lib/gsap";

const appLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/analyze", label: "Analyze" },
    { to: "/rank-tracker", label: "Rank tracker" },
    { to: "/history", label: "History" },
];
const marketingLinks = [
    { to: "/#features", label: "Features" },
    { to: "/#how", label: "How it works" },
    { to: "/#pricing", label: "Pricing" },
];

/** Floating pill bar. */
export default function Navbar() {
    const { user, logout } = useApp();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const overlay = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
    const links = user ? appLinks : marketingLinks;

    useGsap(() => {
        const el = overlay.current;
        if (!el) return;
        tl.current = gsap
            .timeline({ paused: true, defaults: { ease: ease.outExpo } })
            .set(el, { pointerEvents: "auto" })
            .fromTo(el, { autoAlpha: 0, y: -8, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: prefersReducedMotion() ? 0.01 : 0.35 })
            .fromTo(el.querySelectorAll("[data-menu-item]"), { autoAlpha: 0, y: prefersReducedMotion() ? 0 : 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.04 }, "<0.05");
    }, []);

    useEffect(() => {
        const t = tl.current;
        if (!t) return;
        if (open) t.timeScale(1).play();
        else t.timeScale(1.5).reverse();
    }, [open]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="fixed inset-x-0 top-4 z-50">
            <Container size="wide">
                <div className="mx-auto flex h-14 items-center justify-between rounded-full border border-white/70 bg-white/80 backdrop-blur-xl pl-4 pr-2 shadow-soft">
                    <Logo />

                    <nav className="hidden md:flex items-center gap-1 rounded-full bg-muted/70 p-1" aria-label="Primary">
                        {links.map((l) => (
                            <NavLink key={l.to} to={l.to} className={({ isActive }) => `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${isActive && user ? "bg-white text-primary-dark shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <>
                                <span className="hidden lg:inline-flex items-center gap-2 pl-1 pr-3 h-9 rounded-full bg-muted text-sm font-medium">
                                    <span className="size-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                    {user.name.split(" ")[0]}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" to="/login">
                                    Log in
                                </Button>
                                <Button variant="dark" size="sm" to="/register">
                                    Start free
                                </Button>
                            </>
                        )}
                    </div>

                    <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} className="md:hidden relative size-10 grid place-items-center rounded-full hover:bg-muted">
                        <span className={`absolute h-0.5 w-5 rounded bg-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
                        <span className={`absolute h-0.5 w-5 rounded bg-foreground transition-transform duration-300 ease-out-expo ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
                    </button>
                </div>

                <div ref={overlay} id="mobile-menu" className="md:hidden mt-2 card p-2 pointer-events-none opacity-0 origin-top" aria-hidden={!open}>
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} data-menu-item onClick={() => setOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-medium ${isActive && user ? "bg-lavender text-primary-dark" : "hover:bg-muted"}`}>
                            {l.label}
                        </NavLink>
                    ))}
                    <div data-menu-item className="p-2 pt-3 flex gap-2">
                        {user ? (
                            <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full">
                                Log out
                            </Button>
                        ) : (
                            <>
                                <Button variant="secondary" size="sm" to="/login" className="flex-1" onClick={() => setOpen(false)}>
                                    Log in
                                </Button>
                                <Button size="sm" to="/register" className="flex-1" onClick={() => setOpen(false)}>
                                    Start free
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
}
