import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, type DependencyList, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Custom eases mirroring the CSS tokens in index.css. */
export const ease = {
    outExpo: "expo.out",
    outQuart: "power4.out",
    outQuad: "power2.out",
    inOutCubic: "power3.inOut",
    sheet: "power3.out",
} as const;

/** Durations in seconds. Pick easing first, then tune duration to it. */
export const dur = {
    quick: 0.18,
    enter: 0.6,
    move: 0.4,
    exit: 0.2,
    reveal: 0.9,
} as const;

gsap.defaults({ ease: ease.outExpo, duration: dur.enter });

/** True when the user asked for reduced motion. Movement is dropped, opacity kept. */
export function prefersReducedMotion() {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scope GSAP work to a component. Everything created inside `fn` (tweens,
 * ScrollTriggers, SplitTexts) is reverted on cleanup, so React StrictMode
 * double-invocation and route changes never leak animations.
 */
export function useGsap(fn: (ctx: gsap.Context) => void | (() => void), deps: DependencyList = [], scope?: RefObject<HTMLElement | null>) {
    useLayoutEffect(() => {
        let cleanup: void | (() => void);
        const ctx = gsap.context((self) => {
            cleanup = fn(self);
        }, scope?.current ?? undefined);
        return () => {
            cleanup?.();
            ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export { gsap, ScrollTrigger, SplitText };

if (import.meta.env.DEV) {
    // Handy for debugging timelines from the console during development.
    (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}
