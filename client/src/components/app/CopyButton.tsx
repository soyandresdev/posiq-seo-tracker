import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
    const [done, setDone] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
        } catch {
            /* clipboard unavailable */
        }
    };
    return (
        <button onClick={copy} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-semibold transition-colors ${done ? "bg-success/10 text-success" : "bg-card border border-border text-muted-foreground hover:text-foreground"} ${className}`} aria-live="polite">
            {done ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
            {done ? "Copied" : label}
        </button>
    );
}
