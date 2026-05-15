import { useMemo } from "react";

const NOW = Date.now();
import { Bell, Search } from "lucide-react";
import { Gauge, Logo } from "../ui";
import RankChart from "../app/RankChart";
import type { RankEntry } from "../../types/api";

const stats = [
    ["Overall score", "91", "+6 this week"],
    ["Tracked keywords", "12", "4 on page 1"],
    ["Best position", "#2", "seo rank tracker"],
    ["Issues open", "7", "2 critical"],
];

/** The real dashboard pieces, framed like a browser window. */
export default function ProductMockup() {
    const history = useMemo<RankEntry[]>(() => {
        const day = 86400000;
        return Array.from({ length: 30 }, (_, i) => {
            const p = Math.max(1, Math.round(9 - i * 0.22 + Math.sin(i / 2.5) * 1.6));
            return { date: new Date(NOW - (30 - i) * day).toISOString(), position: p, page: 1, title: "", snippet: "" };
        });
    }, []);

    return (
        <div className="rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl p-2 shadow-float">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 px-4 h-10 border-b border-border bg-muted/60">
                    <div className="flex gap-1.5">
                        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="size-2.5 rounded-full bg-[#febc2e]" />
                        <span className="size-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="mx-auto h-6 w-72 max-w-[50%] rounded-md bg-card border border-border text-[11px] text-muted-foreground grid place-items-center">app.rankpilot.dev/dashboard</div>
                </div>

                {/* App bar */}
                <div className="flex items-center justify-between px-5 h-14">
                    <Logo />
                    <div className="hidden sm:flex items-center gap-2 h-9 w-72 rounded-full bg-muted px-3 text-sm text-muted-foreground">
                        <Search size={14} /> Search
                    </div>
                    <div className="flex items-center gap-3">
                        <Bell size={16} className="text-muted-foreground" />
                        <span className="size-8 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">A</span>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 space-y-4 bg-background/60">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {stats.map(([l, v, h]) => (
                            <div key={l} className="card p-4">
                                <div className="eyebrow">{l}</div>
                                <div className="mt-2 font-heavy text-2xl tracking-tight tabular-nums">{v}</div>
                                <div className="text-xs text-muted-foreground mt-1">{h}</div>
                            </div>
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-3">
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-sm">Position · seo rank tracker</div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-lavender text-primary-dark font-medium">30 days</span>
                            </div>
                            <RankChart history={history} height={200} />
                        </div>
                        <div className="card p-4 flex flex-col items-center justify-center gap-2">
                            <div className="font-semibold text-sm self-start">Performance</div>
                            <Gauge value={91} size={130} stroke={10} label="stripe.com" trigger="mount" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
