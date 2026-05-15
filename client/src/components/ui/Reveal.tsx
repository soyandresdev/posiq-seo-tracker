import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGsap, prefersReducedMotion, ease, dur } from "../../lib/gsap";

type Props = {
    as?: ElementType;
    children: ReactNode;
    className?: string;
    delay?: number;
    /** Pixels to rise from. Set lower for less important items. */
    y?: number;
    /** Animate on mount instead of on scroll. */
    immediate?: boolean;
    /** Stagger direct children instead of the wrapper. */
    stagger?: number;
};

/** Fade-up on scroll. One entrance per container: don't nest Reveals. */
export default function Reveal({ as: Tag = "div", children, className = "", delay = 0, y = 24, immediate = false, stagger }: Props) {
    const ref = useRef<HTMLElement>(null);

    useGsap(() => {
        const el = ref.current;
        if (!el) return;
        const targets = stagger !== undefined ? Array.from(el.children) : el;
        const reduced = prefersReducedMotion();
        gsap.from(targets, {
            autoAlpha: 0,
            y: reduced ? 0 : y,
            duration: reduced ? 0.4 : dur.enter,
            ease: ease.outExpo,
            delay,
            stagger: stagger ?? 0,
            ...(immediate ? {} : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        });
    }, []);

    return (
        <Tag ref={ref} className={className}>
            {children}
        </Tag>
    );
}
