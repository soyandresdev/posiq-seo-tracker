import { useState } from "react";
import { Globe, ImageOff, MoreVertical } from "lucide-react";
import { hostnameOf, type Analysis } from "../../types/api";

const TITLE_MAX = 60;
const DESC_MAX = 160;

function Meter({ n, max, ok }: { n: number; max: number; ok: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tabular-nums ${ok ? "text-success" : "text-warning"}`}>
            <span className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                <span className={`block h-full rounded-full ${ok ? "bg-success" : "bg-warning"}`} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} />
            </span>
            {n}/{max}
        </span>
    );
}

/** How the page reads in a Google result. Widths mirror desktop results. */
export function SerpPreview({ a }: { a: Analysis }) {
    const host = hostnameOf(a.url);
    const title = a.metaData.title || "Untitled page";
    const desc = a.metaData.description || "Google will pick a snippet from the page text, which is rarely what you want.";
    const path = (() => {
        try {
            const u = new URL(a.url);
            return u.pathname === "/" ? "" : u.pathname.split("/").filter(Boolean).join(" › ");
        } catch {
            return "";
        }
    })();
    return (
        <div>
            <div className="rounded-xl bg-white border border-border p-4 max-w-[600px]" style={{ fontFamily: "Arial, sans-serif" }}>
                <div className="flex items-center gap-3">
                    <span className="size-7 rounded-full bg-muted grid place-items-center text-muted-foreground">
                        <Globe size={14} />
                    </span>
                    <span className="min-w-0 leading-tight">
                        <span className="block text-[14px] text-[#202124] truncate">{host}</span>
                        <span className="block text-[12px] text-[#4d5156] truncate">
                            {a.url.replace(/\/$/, "")}
                            {path && ` › ${path}`}
                        </span>
                    </span>
                    <MoreVertical size={16} className="ml-auto text-[#4d5156] shrink-0" />
                </div>
                <div className="mt-2 text-[20px] leading-[1.3] text-[#1a0dab] truncate">{title}</div>
                <div className="mt-1 text-[14px] leading-[1.58] text-[#4d5156] line-clamp-2">{desc}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                    Title <Meter n={a.metaData.title.length} max={TITLE_MAX} ok={a.metaData.title.length > 0 && a.metaData.title.length <= 65} />
                </span>
                <span className="inline-flex items-center gap-2">
                    Description <Meter n={a.metaData.description.length} max={DESC_MAX} ok={a.metaData.description.length > 0 && a.metaData.description.length <= DESC_MAX} />
                </span>
            </div>
        </div>
    );
}

/** Link card as shown by X, LinkedIn or Slack, from the Open Graph tags. */
export function SocialPreview({ a }: { a: Analysis }) {
    const m = a.metaData;
    const [broken, setBroken] = useState(false);
    const title = m.ogTitle || m.title;
    const desc = m.ogDescription || m.description;
    const missing = [!m.ogTitle && "og:title", !m.ogDescription && "og:description", !m.ogImage && "og:image"].filter(Boolean) as string[];
    return (
        <div>
            <div className="rounded-xl overflow-hidden border border-border bg-white max-w-[520px]">
                <div className="aspect-[1.91/1] bg-muted grid place-items-center overflow-hidden">
                    {m.ogImage && !broken ? <img src={m.ogImage} alt="" className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} /> : (
                        <span className="flex flex-col items-center gap-2 text-muted-foreground text-xs text-center px-6">
                            <ImageOff size={22} /> {m.ogImage ? "og:image could not be loaded" : "No og:image"}
                        </span>
                    )}
                </div>
                <div className="p-3 border-t border-border">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{hostnameOf(a.url)}</div>
                    <div className="mt-0.5 text-sm font-semibold truncate">{title || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{desc || "No description"}</div>
                </div>
            </div>
            <p className={`mt-3 text-xs ${missing.length || broken ? "text-warning" : "text-success"}`}>
                {missing.length ? `Missing ${missing.join(", ")}. Shared links will look bare.` : broken ? "og:image is set but the image did not load. Check that the URL is public and absolute." : "All Open Graph tags present."}
            </p>
        </div>
    );
}
