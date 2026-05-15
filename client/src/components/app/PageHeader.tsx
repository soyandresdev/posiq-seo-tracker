import type { ReactNode } from "react";

type Props = { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode };

export default function PageHeader({ eyebrow, title, description, action }: Props) {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                {eyebrow && <div className="eyebrow mb-2 text-primary-dark">{eyebrow}</div>}
                <h1 className="font-display text-display-lg text-balance">{title}</h1>
                {description && <p className="mt-2 text-muted-foreground max-w-[52ch] text-pretty">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    );
}
