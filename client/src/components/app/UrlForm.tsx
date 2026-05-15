import { ArrowRight, Globe } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../ui";

type Props = { initial?: string; onSubmit: (url: string) => void; placeholder?: string; cta?: string; autoFocus?: boolean; loading?: boolean; size?: "md" | "lg"; className?: string };

/** Pill URL input with a violet submit. */
export default function UrlForm({ initial = "", onSubmit, placeholder = "yourdomain.com", cta = "Analyze", autoFocus, loading, size = "md", className = "" }: Props) {
    const [value, setValue] = useState(initial);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
    };
    return (
        <form onSubmit={submit} className={`flex items-center gap-2 rounded-full bg-card border border-border p-1.5 pl-4 shadow-soft focus-within:border-lavender-deep transition-colors ${className}`}>
            <Globe size={18} className="text-muted-foreground shrink-0" />
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} aria-label="Website URL" inputMode="url" autoCapitalize="none" spellCheck={false} className={`flex-1 min-w-0 bg-transparent outline-none font-medium placeholder:text-muted-foreground/70 ${size === "lg" ? "text-base h-11" : "text-sm h-9"}`} />
            <Button type="submit" size={size} loading={loading} icon={<ArrowRight size={16} />}>
                {cta}
            </Button>
        </form>
    );
}
