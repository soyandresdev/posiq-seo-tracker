import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button, Container } from "../components/ui";
import PageHeader from "../components/app/PageHeader";
import StatTile from "../components/app/StatTile";
import UrlForm from "../components/app/UrlForm";
import AnalysisRow from "../components/app/AnalysisRow";
import EmptyState from "../components/app/EmptyState";
import { RowSkeleton } from "../components/app/Skeleton";
import { scoreTone } from "../lib/score";
import type { AnalysisSummary } from "../types/api";

const FREE_DAILY_LIMIT = 5;

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
    const { user, api } = useApp();
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState<AnalysisSummary[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        api.get("/api/analysis/list?limit=6")
            .then(({ data }) => {
                if (!cancelled) setAnalyses(data.success ? data.analyses : []);
            })
            .catch(() => {
                if (!cancelled) setAnalyses([]);
            });
        return () => {
            cancelled = true;
        };
    }, [api]);

    const completed = (analyses ?? []).filter((a) => a.status === "completed");
    const avg = completed.length ? Math.round(completed.reduce((s, a) => s + a.overallScore, 0) / completed.length) : 0;
    const left = user?.plan === "pro" ? "∞" : Math.max(0, FREE_DAILY_LIMIT - (user?.analysisCount ?? 0));

    return (
        <Container size="wide" as="main" className="pt-28 pb-24">
            <PageHeader eyebrow="Dashboard" title={<>{greeting()}, {user?.name.split(" ")[0]}.</>} description="Run a new audit or pick up where you left off." />

            <section className="mt-8 grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 card p-6">
                    <div className="font-semibold">New analysis</div>
                    <p className="mt-1 text-sm text-muted-foreground">Paste a URL. A report lands in about thirty seconds.</p>
                    <UrlForm className="mt-4" onSubmit={(url) => navigate(`/analyze?url=${encodeURIComponent(url)}`)} />
                </div>
                <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                    <StatTile label="Scans" value={analyses?.length ?? 0} hint="last 6 shown" />
                    <StatTile label="Avg score" value={avg} tone={completed.length ? scoreTone(avg) : undefined} />
                    <StatTile label="Left today" accent="blue" value={left} hint={user?.plan === "pro" ? "Pro plan" : `of ${FREE_DAILY_LIMIT}`} />
                </div>
            </section>

            <section className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-display-sm">Recent analyses</h2>
                    {!!analyses?.length && (
                        <Button variant="link" size="sm" to="/history" icon={<ArrowUpRight size={14} />}>
                            View all
                        </Button>
                    )}
                </div>
                {analyses === null ? <RowSkeleton rows={4} /> : analyses.length === 0 ? <EmptyState title="No analyses yet." description="Paste a URL above to run your first audit." /> : <div className="card divide-y divide-border">{analyses.map((a) => <AnalysisRow key={a._id} analysis={a} />)}</div>}
            </section>
        </Container>
    );
}
