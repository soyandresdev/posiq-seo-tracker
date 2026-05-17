import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { Button, Container } from "../components/ui";
import EmptyState from "../components/app/EmptyState";
import PositionBadge from "../components/app/PositionBadge";
import RankChart from "../components/app/RankChart";
import { Skeleton } from "../components/app/Skeleton";
import { formatDate } from "../lib/format";
import { flag } from "../lib/locales";
import type { KeywordTracking } from "../types/api";

export default function RankDetail() {
  const { id } = useParams();
  const { api } = useApp();
  const navigate = useNavigate();
  const [t, setT] = useState<KeywordTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  // Load, and keep polling while a check is running
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const { data } = await api.get(`/api/rank/${id}`);
        if (cancelled) return;
        if (!data.success) return setError("Keyword not found");
        setT(data.tracking);
        if (data.tracking.status === "checking") timer = setTimeout(load, 3000);
      } catch {
        if (!cancelled) setError("Could not load this keyword");
      }
    };
    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [api, id]);

  const refresh = async () => {
    if (!t) return;
    setT({ ...t, status: "checking" });
    try {
      await api.post(`/api/rank/${t._id}/refresh`);
      const poll = async () => {
        const { data } = await api.get(`/api/rank/${t._id}`);
        if (data.tracking.status === "checking") setTimeout(poll, 3000);
        else setT(data.tracking);
      };
      setTimeout(poll, 3000);
    } catch {
      toast.error("Could not start a check");
      setT({ ...t, status: "failed" });
    }
  };
  const toggle = async () => {
    if (!t) return;
    const { data } = await api.put(`/api/rank/${t._id}/toggle`);
    setT({ ...t, active: data.tracking.active });
  };
  const remove = async () => {
    if (!t) return;
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 3000);
      return;
    }
    await api.delete(`/api/rank/${t._id}`);
    toast.success("Keyword removed");
    navigate("/rank-tracker");
  };

  if (error)
    return (
      <EmptyState
        title={error}
        action={<Button to="/rank-tracker">Back to tracker</Button>}
      />
    );
  if (!t) return <DetailSkeleton />;

  const checks = t.rankHistory.length;
  const checking = t.status === "checking";

  return (
    <Container size="wide" as="main" className="pt-24 pb-24">
      <Link
        to="/rank-tracker"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> Rank tracker
      </Link>

      <header className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="eyebrow mb-2 text-primary-dark">
            Keyword ·{" "}
            {t.country && (
              <>
                {flag(t.country)} {t.country.toUpperCase()} · {t.language}{" "}
                ·{" "}
              </>
            )}
            {t.active ? "tracking daily" : "paused"}
            {checking && (
              <span className="ml-2 animate-pulse text-primary">
                · checking now
              </span>
            )}
          </div>
          <h1 className="font-display text-display-lg break-words">
            {t.keyword}
          </h1>
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.url} <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            onClick={refresh}
            disabled={checking}
            icon={
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
            }
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={toggle}
            icon={t.active ? <Pause size={14} /> : <Play size={14} />}
          >
            {t.active ? "Pause" : "Resume"}
          </Button>
          <Button
            variant={armed ? "primary" : "secondary"}
            onClick={remove}
            icon={<Trash2 size={14} />}
            className={armed ? "bg-danger! border-danger! text-white!" : ""}
          >
            {armed ? "Confirm" : "Delete"}
          </Button>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-5">
          <div className="eyebrow">Position</div>
          <div className="mt-2">
            <PositionBadge
              position={t.currentPosition}
              change={t.positionChange}
              size="lg"
            />
          </div>
        </div>
        {[
          ["Best", t.bestPosition ? `#${t.bestPosition}` : "—"],
          ["Page", t.currentPage ?? "—"],
          ["Checks", checks],
        ].map(([k, v]) => (
          <div key={k} className="card p-5">
            <div className="eyebrow">{k}</div>
            <div className="mt-3 font-heavy text-display-md tabular-nums leading-none tracking-tight">
              {v}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 card p-6">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm font-semibold">Position over time</h2>
          {t.lastChecked && (
            <span className="text-xs text-muted-foreground">
              Last checked{" "}
              {formatDate(t.lastChecked, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <RankChart history={t.rankHistory} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 card p-6">
          <h2 className="text-sm font-semibold mb-3">
            Top results · {t.competitors.length}
          </h2>
          {t.competitors.length ? (
            <ol className="divide-y divide-border">
              {t.competitors.map((c) => {
                const you = c.domain.replace(/^www\./, "") === t.domain;
                return (
                  <li
                    key={c.position}
                    className={`grid grid-cols-[2.5rem_1fr] gap-4 py-3.5 `}
                  >
                    <span className="size-8 rounded-full bg-muted grid place-items-center font-heavy text-sm tabular-nums">
                      {c.position}
                    </span>
                    <span className="min-w-0">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm truncate hover:underline underline-offset-4"
                      >
                        {c.title || c.domain}
                      </a>
                      <span className="block text-xs text-muted-foreground truncate">
                        {c.domain}
                        {you && " · you"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              No competitor data yet.
            </p>
          )}
        </section>

        <section className="lg:col-span-5 card p-6">
          <h2 className="text-sm font-semibold mb-3">History</h2>
          {checks ? (
            <ol className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {[...t.rankHistory].reverse().map((h) => (
                <li
                  key={h.date}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {formatDate(h.date)}
                  </span>
                  <span className="tabular-nums">
                    {h.position ? `#${h.position}` : "not found"}
                  </span>
                  <span className="eyebrow w-14 text-right">
                    {h.page ? `p. ${h.page}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              First check pending.
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}

function DetailSkeleton() {
  return (
    <Container size="wide" className="pt-24 pb-24">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-80 mt-8" />
      <Skeleton className="h-4 w-56 mt-3" />
      <div className="mt-8 grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-64 mt-10" />
    </Container>
  );
}
