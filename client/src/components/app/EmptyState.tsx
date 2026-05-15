import type { ReactNode } from "react";

export default function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="py-16 px-6 text-center rounded-2xl border border-dashed border-lavender-deep bg-lavender/30">
            <div className="font-display text-display-sm">{title}</div>
            {description && <p className="mt-2 text-muted-foreground max-w-[40ch] mx-auto text-pretty">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
