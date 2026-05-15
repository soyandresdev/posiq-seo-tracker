import type { ReactNode } from "react";

export default function SectionHeader({ tag, title, description }: { tag: string; title: ReactNode; description?: string }) {
    return (
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-card border border-border shadow-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" /> {tag}
            </span>
            <h2 className="mt-5 font-display text-display-lg text-balance">{title}</h2>
            {description && <p className="mt-4 text-muted-foreground text-pretty">{description}</p>}
        </div>
    );
}
