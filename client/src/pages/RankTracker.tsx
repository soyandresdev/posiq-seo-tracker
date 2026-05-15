import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowUpRight, Pause, Play, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Button, Container } from "../components/ui";
import PageHeader from "../components/app/PageHeader";
import StatTile from "../components/app/StatTile";
import EmptyState from "../components/app/EmptyState";
import PositionBadge from "../components/app/PositionBadge";
import { RowSkeleton } from "../components/app/Skeleton";
import { gsap, useGsap, prefersReducedMotion } from "../lib/gsap";
import { formatDate } from "../lib/format";
import type { KeywordTracking } from "../types/api";

type Item = Omit<KeywordTracking, "rankHistory">;
type Filter = "all" | "active" | "paused";
type Sort = "newest" | "position" | "gain";

export default function RankTracker() {
    const { api } = useApp();
    const [items, setItems] = useState<Item[] | null>(null);
    const [adding, setAdding] = useState(false);
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("newest");

    useEffect(() => {
        let cancelled = false;
        api.get("/api/rank/list")
            .then(({ data }) => {
                if (!cancelled) setItems(data.success ? data.keywords : []);
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            });
        return () => {
            cancelled = true;
        };
    }, [api]);

    // Poll anything that is still checking
    const checking = useMemo(() => (items ?? []).filter((k) => k.status === "checking").map((k) => k._id), [items]);
    useEffect(() => {
        if (!checking.length) return;
        const t = setInterval(async () => {
            for (const id of checking) {
                try {
                    const { data } = await api.get(`/api/rank/${id}`);
                    if (data.success && data.tracking.status !== "checking") {
                        const { rankHistory, ...rest } = data.tracking as KeywordTracking;
                        void rankHistory;
                        setItems((prev) => prev?.map((k) => (k._id === id ? rest : k)) ?? prev);
                    }
                } catch {
                    /* keep polling */
                }
            }
        }, 3000);
        return () => clearInterval(t);
    }, [checking, api]);

    const patch = (id: string, p: Partial<Item>) => setItems((prev) => prev?.map((k) => (k._id === id ? { ...k, ...p } : k)) ?? prev);

    const refresh = async (id: string) => {
        patch(id, { status: "checking" });
        try {
            await api.post(`/api/rank/${id}/refresh`);
        } catch {
            patch(id, { status: "failed" });
            toast.error("Could not start a check");
        }
    };
    const toggle = async (id: string) => {
        try {
            const { data } = await api.put(`/api/rank/${id}/toggle`);
            patch(id, { active: data.tracking.active });
        } catch {
            toast.error("Could not update");
        }
    };
    const remove = async (id: string) => {
        try {
            await api.delete(`/api/rank/${id}`);
            setItems((prev) => prev?.filter((k) => k._id !== id) ?? prev);
            toast.success("Keyword removed");
        } catch {
            toast.error("Could not delete");
        }
    };

    const visible = useMemo(() => {
        let list = items ?? [];
        if (q) list = list.filter((k) => k.keyword.includes(q.toLowerCase()) || k.domain.includes(q.toLowerCase()));
        if (filter !== "all") list = list.filter((k) => (filter === "active" ? k.active : !k.active));
        const by: Record<Sort, (a: Item, b: Item) => number> = {
            newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
            position: (a, b) => (a.currentPosition ?? 999) - (b.currentPosition ?? 999),
            gain: (a, b) => b.positionChange - a.positionChange,
        };
        return [...list].sort(by[sort]);
    }, [items, q, filter, sort]);

    const all = items ?? [];
    const ranked = all.filter((k) => k.currentPosition !== null);
    const avg = ranked.length ? Math.round(ranked.reduce((s, k) => s + (k.currentPosition as number), 0) / ranked.length) : 0;

    return (
        <Container size="wide" as="main" className="pt-28 pb-24">
            <PageHeader eyebrow="Rank tracker" title="Keywords you're watching." description="Checked on Google every morning at 06:00. Refresh any time." action={<Button onClick={() => setAdding((a) => !a)} icon={<Plus size={16} className={`transition-transform duration-300 ease-out-expo ${adding ? "rotate-45" : ""}`} />}>{adding ? "Close" : "Add keyword"}</Button>} />

            <AddPanel open={adding} onAdded={(t) => { setItems((prev) => [t, ...(prev ?? [])]); setAdding(false); }} />

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile label="Tracked" value={all.length} />
                <StatTile label="On page 1" accent="blue" value={all.filter((k) => k.currentPage === 1).length} />
                <StatTile label="Avg position" value={avg} />
                <StatTile label="Improved" value={all.filter((k) => k.positionChange > 0).length} hint="since last check" />
            </div>

            <div className="mt-8 flex flex-col md:flex-row md:items-center gap-3">
                <label className="flex items-center gap-2 h-10 px-4 rounded-full bg-card border border-border shadow-card flex-1 focus-within:border-lavender-deep transition-colors">
                    <Search size={15} className="text-muted-foreground" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter keywords" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
                </label>
                <div role="tablist" className="flex h-10 p-1 rounded-full bg-muted">
                    {(["all", "active", "paused"] as Filter[]).map((f) => (
                        <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`px-3.5 rounded-full text-sm font-medium capitalize transition-colors duration-200 ${filter === f ? "bg-card text-primary-dark shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="select-pill">
                    <option value="newest">Newest</option>
                    <option value="position">Best position</option>
                    <option value="gain">Biggest gain</option>
                </select>
            </div>

            <div className="mt-6">
                {items === null ? (
                    <RowSkeleton rows={4} />
                ) : visible.length === 0 ? (
                    <EmptyState title={all.length ? "Nothing matches." : "No keywords yet."} description={all.length ? "Try another filter." : "Add a keyword and the page you want it to rank for."} action={!all.length ? <Button onClick={() => setAdding(true)}>Add your first keyword</Button> : undefined} />
                ) : (
                    <div className="card divide-y divide-border">
                        {visible.map((k) => (
                            <Row key={k._id} k={k} onRefresh={refresh} onToggle={toggle} onDelete={remove} />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}

function AddPanel({ open, onAdded }: { open: boolean; onAdded: (t: Item) => void }) {
    const { api } = useApp();
    const wrap = useRef<HTMLDivElement>(null);
    const [keyword, setKeyword] = useState("");
    const [url, setUrl] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useGsap(() => {
        if (!wrap.current) return;
        gsap.to(wrap.current, { height: open ? "auto" : 0, autoAlpha: open ? 1 : 0, duration: prefersReducedMotion() ? 0.01 : 0.45, ease: "power4.out", overwrite: true });
        if (open) wrap.current.querySelector("input")?.focus();
    }, [open]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!keyword.trim() || !url.trim()) return;
        setBusy(true);
        setError(null);
        try {
            const { data } = await api.post("/api/rank/add", { keyword: keyword.trim(), url: url.trim() });
            if (!data.success) throw new Error(data.message);
            onAdded(data.tracking);
            setKeyword("");
            setUrl("");
            toast.success("Tracking started");
        } catch (err) {
            setError(axios.isAxiosError(err) ? ((err.response?.data as { message?: string })?.message ?? "Could not add keyword") : err instanceof Error ? err.message : "Could not add keyword");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div ref={wrap} className="overflow-hidden h-0 opacity-0" aria-hidden={!open}>
            <form onSubmit={submit} className="card p-6 mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
                <label className="block">
                    <span className="text-sm font-semibold block mb-2">Keyword</span>
                    <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="seo rank tracker" disabled={!open} className="w-full h-11 px-4 rounded-xl bg-card border border-border outline-none focus:border-primary transition-colors text-sm" />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold block mb-2">Page to rank</span>
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourdomain.com/page" disabled={!open} inputMode="url" className="w-full h-11 px-4 rounded-xl bg-card border border-border outline-none focus:border-primary transition-colors text-sm" />
                </label>
                <Button type="submit" variant="primary" loading={busy} disabled={!open}>
                    Track
                </Button>
                {error && (
                    <p role="alert" className="md:col-span-3 text-sm text-danger">
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}

function Row({ k, onRefresh, onToggle, onDelete }: { k: Item; onRefresh: (id: string) => void; onToggle: (id: string) => void; onDelete: (id: string) => Promise<void> }) {
    const [armed, setArmed] = useState(false);
    const checking = k.status === "checking";
    return (
        <div className={`group grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-4 md:gap-8 p-4 md:px-5 transition-[background-color,opacity] duration-200 hover:bg-lavender/30 ${k.active ? "" : "opacity-60"}`}>
            <Link to={`/rank/${k._id}`} className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg truncate">{k.keyword}</span>
                    <ArrowUpRight size={14} className="shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-[opacity,transform] duration-300 ease-out-expo group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {k.domain}
                    {k.lastChecked && <> · checked {formatDate(k.lastChecked, { day: "numeric", month: "short" })}</>}
                    {!k.active && " · paused"}
                    {k.status === "failed" && <span className="text-danger"> · last check failed</span>}
                </div>
            </Link>

            <div className="justify-self-end md:justify-self-start">{checking ? <span className="eyebrow animate-pulse">Checking…</span> : <PositionBadge position={k.currentPosition} change={k.positionChange} />}</div>

            <div className="hidden md:block text-right w-16">
                <div className="font-heavy text-sm tabular-nums">{k.bestPosition ? `#${k.bestPosition}` : "—"}</div>
                <div className="eyebrow text-[10px]">best</div>
            </div>
            <div className="hidden md:block text-right w-16">
                <div className="font-heavy text-sm tabular-nums">{k.currentPage ?? "—"}</div>
                <div className="eyebrow text-[10px]">page</div>
            </div>

            <div className="col-span-2 md:col-span-1 flex items-center gap-1 justify-end">
                <IconBtn label="Refresh position" onClick={() => onRefresh(k._id)} disabled={checking}>
                    <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
                </IconBtn>
                <IconBtn label={k.active ? "Pause tracking" : "Resume tracking"} onClick={() => onToggle(k._id)}>
                    {k.active ? <Pause size={15} /> : <Play size={15} />}
                </IconBtn>
                <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); } else onDelete(k._id); }} aria-label={armed ? "Confirm delete" : "Delete"} className={`h-9 rounded-full grid place-items-center text-xs transition-[background-color,color] duration-200 pressable ${armed ? "px-3 bg-danger text-white" : "w-9 text-muted-foreground hover:text-danger hover:bg-danger/10"}`}>
                    {armed ? "Confirm" : <Trash2 size={15} />}
                </button>
            </div>
        </div>
    );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
    return (
        <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="size-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 pressable disabled:opacity-40">
            {children}
        </button>
    );
}
