import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Button, Container } from "../components/ui";
import PageHeader from "../components/app/PageHeader";
import AnalysisRow from "../components/app/AnalysisRow";
import EmptyState from "../components/app/EmptyState";
import { RowSkeleton } from "../components/app/Skeleton";
import type { AnalysisStatus, AnalysisSummary, Pagination } from "../types/api";

type Sort = "newest" | "oldest" | "score_high" | "score_low";
const statuses: { value: AnalysisStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" },
];

export default function History() {
    const { api } = useApp();
    const [items, setItems] = useState<AnalysisSummary[] | null>(null);
    const [page, setPageState] = useState(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<AnalysisStatus | "all">("all");
    const [sort, setSort] = useState<Sort>("newest");
    const setPage = (next: number | ((p: number) => number)) => {
        setItems(null);
        setPageState(next);
    };

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/analysis/list?page=${page}&limit=12`)
            .then(({ data }) => {
                if (cancelled) return;
                setItems(data.success ? data.analyses : []);
                setPagination(data.pagination ?? null);
            })
            .catch(() => {
                if (!cancelled) setItems([]);
            });
        return () => {
            cancelled = true;
        };
    }, [api, page]);

    const visible = useMemo(() => {
        let list = items ?? [];
        if (q) list = list.filter((a) => a.url.toLowerCase().includes(q.toLowerCase()));
        if (status !== "all") list = list.filter((a) => a.status === status);
        const by: Record<Sort, (a: AnalysisSummary, b: AnalysisSummary) => number> = {
            newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
            oldest: (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
            score_high: (a, b) => b.overallScore - a.overallScore,
            score_low: (a, b) => a.overallScore - b.overallScore,
        };
        return [...list].sort(by[sort]);
    }, [items, q, status, sort]);

    const remove = async (id: string) => {
        try {
            await api.delete(`/api/analysis/${id}`);
            setItems((prev) => (prev ? prev.filter((a) => a._id !== id) : prev));
            toast.success("Analysis deleted");
        } catch {
            toast.error("Could not delete");
        }
    };

    return (
        <Container size="wide" as="main" className="pt-28 pb-24">
            <PageHeader eyebrow="History" title="Every audit you've run." description={pagination ? `${pagination.total} total.` : undefined} action={<Button to="/analyze">New analysis</Button>} />

            <div className="mt-8 flex flex-col md:flex-row md:items-center gap-3">
                <label className="flex items-center gap-2 h-10 px-4 rounded-full bg-card border border-border shadow-card flex-1 focus-within:border-lavender-deep transition-colors">
                    <Search size={15} className="text-muted-foreground" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by URL" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" />
                </label>
                <div role="tablist" aria-label="Status" className="flex h-10 p-1 rounded-full bg-muted">
                    {statuses.map((s) => (
                        <button key={s.value} role="tab" aria-selected={status === s.value} onClick={() => setStatus(s.value)} className={`px-3.5 rounded-full text-sm font-medium transition-colors duration-200 ${status === s.value ? "bg-card text-primary-dark shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
                            {s.label}
                        </button>
                    ))}
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="select-pill">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="score_high">Highest score</option>
                    <option value="score_low">Lowest score</option>
                </select>
            </div>

            <div className="mt-6">
                {items === null ? <RowSkeleton rows={6} /> : visible.length === 0 ? <EmptyState title={q || status !== "all" ? "Nothing matches." : "No analyses yet."} description={q || status !== "all" ? "Try a different filter." : "Run your first audit to see it here."} action={!q && status === "all" ? <Button to="/analyze">Analyze a site</Button> : undefined} /> : <div className="card divide-y divide-border">{visible.map((a) => <AnalysisRow key={a._id} analysis={a} onDelete={remove} />)}</div>}
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm">
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                    </Button>
                    <span className="eyebrow">Page {page} / {pagination.pages}</span>
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>
                        Next
                    </Button>
                </div>
            )}
        </Container>
    );
}
