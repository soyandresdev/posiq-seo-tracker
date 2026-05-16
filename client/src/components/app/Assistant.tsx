import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Sparkles, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { gsap, useGsap, prefersReducedMotion, ease } from "../../lib/gsap";
import { clearChat, loadChat, streamChat, type ChatMessage } from "../../lib/chat";
import Markdown from "./Markdown";

const suggestions = ["What should I fix first?", "Write a better meta description", "Why is my performance score low?", "Give me alt text for the images"];

/** Report-scoped AI assistant. Floating trigger, sliding panel, streamed replies. */
export default function Assistant({ analysisId, host }: { analysisId: string; host: string }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [quota, setQuota] = useState({ used: 0, limit: 10 });
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLDivElement>(null);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const abort = useRef<AbortController | null>(null);

    // Slide the panel in from the right; reduced motion fades only
    useGsap(() => {
        if (!panel.current) return;
        const reduced = prefersReducedMotion();
        gsap.to(panel.current, { x: open ? 0 : reduced ? 0 : 24, autoAlpha: open ? 1 : 0, duration: open ? 0.45 : 0.2, ease: open ? ease.outExpo : ease.outQuad, overwrite: true });
    }, [open]);

    useEffect(() => {
        if (!open || loaded) return;
        loadChat(analysisId)
            .then((s) => {
                setMessages(s.messages);
                setQuota({ used: s.used, limit: s.limit });
            })
            .catch(() => undefined)
            .finally(() => setLoaded(true));
    }, [open, loaded, analysisId]);

    useEffect(() => {
        if (open) textarea.current?.focus();
    }, [open]);

    useEffect(() => {
        list.current?.scrollTo({ top: list.current.scrollHeight });
    }, [messages]);

    const send = async (text: string) => {
        const message = text.trim();
        if (!message || busy) return;
        setInput("");
        setBusy(true);
        setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
        abort.current = new AbortController();
        try {
            const q = await streamChat(
                analysisId,
                message,
                (delta) => {
                    setMessages((m) => {
                        const next = [...m];
                        const last = next[next.length - 1];
                        if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + delta };
                        return next;
                    });
                },
                abort.current.signal
            );
            if (q.limit) setQuota(q);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setMessages((m) => m.slice(0, -2));
            toast.error(msg);
        } finally {
            setBusy(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        send(input);
    };
    const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };
    const reset = async () => {
        await clearChat(analysisId);
        setMessages([]);
        setQuota((q) => ({ ...q, used: 0 }));
    };

    const left = Math.max(0, quota.limit - quota.used);

    return (
        <>
            {!open && (
                <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-ink text-white font-semibold text-sm shadow-float pressable hover:bg-[#25254a] transition-colors">
                    <span className="size-6 rounded-full bg-primary grid place-items-center">
                        <Sparkles size={13} />
                    </span>
                    Ask about this report
                </button>
            )}

            <div ref={panel} className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] sm:inset-y-3 sm:right-3 opacity-0 pointer-events-none flex flex-col card sm:rounded-2xl rounded-none shadow-float" style={{ pointerEvents: open ? "auto" : "none" }} role="dialog" aria-label="Report assistant" aria-hidden={!open}>
                <header className="flex items-center gap-3 p-4 border-b border-border">
                    <span className="size-9 rounded-full bg-primary text-white grid place-items-center shadow-primary">
                        <Sparkles size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm">Assistant</div>
                        <div className="text-xs text-muted-foreground truncate">Knows this report for {host}</div>
                    </div>
                    {messages.length > 0 && (
                        <button onClick={reset} aria-label="Clear conversation" className="size-9 rounded-full grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Trash2 size={15} />
                        </button>
                    )}
                    <button onClick={() => setOpen(false)} aria-label="Close assistant" className="size-9 rounded-full grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X size={16} />
                    </button>
                </header>

                <div ref={list} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                    {messages.length === 0 && (
                        <div>
                            <p className="text-muted-foreground">Ask anything about this audit. I only use what's in the report, so answers are about your page, not SEO in general.</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {suggestions.map((s) => (
                                    <button key={s} onClick={() => send(s)} className="rounded-full bg-lavender text-primary-dark px-3 py-1.5 text-xs font-semibold hover:bg-lavender-deep transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                            <div className={m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary text-white px-4 py-2.5" : "max-w-full leading-relaxed"}>
                                {m.role === "user" ? m.content : m.content ? <Markdown text={m.content} /> : <span className="inline-flex gap-1 py-1" aria-label="Thinking"><Dot /><Dot delay="150ms" /><Dot delay="300ms" /></span>}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={onSubmit} className="p-3 border-t border-border">
                    <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-1.5 pl-3 focus-within:border-lavender-deep transition-colors">
                        <textarea ref={textarea} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} rows={1} placeholder={left ? "Ask about this report…" : "No messages left for this report"} disabled={busy || !left} className="flex-1 resize-none bg-transparent outline-none text-sm py-2 max-h-32 disabled:opacity-60" />
                        <button type="submit" disabled={busy || !input.trim() || !left} aria-label="Send" className="size-9 rounded-full bg-primary text-white grid place-items-center disabled:opacity-40 pressable">
                            <ArrowUp size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Enter to send · Shift+Enter for a new line</span>
                        <span className={left <= 2 ? "text-warning font-semibold" : ""}>
                            {left} of {quota.limit} left
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
    return <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: delay }} />;
}
