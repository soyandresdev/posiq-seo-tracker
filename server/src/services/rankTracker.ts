import type { Browser } from "playwright-core";
import { closeQuietly, openPage } from "./browser.ts";
import type { RankCheck, Result, SerpResult } from "../types/api.ts";

const PAGES = 5;
const RESULTS_PER_PAGE = 10;

type RawResult = Omit<SerpResult, "position">;

const sameSite = (domain: string, target: string) => domain.includes(target) || target.includes(domain);

/** Search Google for a keyword and find where the target domain ranks in the first pages. */
export type SearchLocale = { country: string; language: string };

export async function rankTracker(keyword: string, targetDomain: string, locale: SearchLocale = { country: "us", language: "en" }): Promise<Result<RankCheck>> {
    let browser: Browser | null = null;
    try {
        const opened = await openPage(45_000);
        browser = opened.browser;
        const { page } = opened;
        const target = targetDomain.replace(/^www\./, "").toLowerCase();

        await page.goto("https://www.google.com", { waitUntil: "networkidle" });
        try {
            const consent = await page.$('button[id="L2AGLb"], form[action*="consent"] button');
            if (consent) {
                await consent.click();
                await page.waitForTimeout(1500);
            }
        } catch {
            /* no consent dialog */
        }

        const all: SerpResult[] = [];
        let found = null as (SerpResult & { page: number }) | null;

        for (let g = 0; g < PAGES && !found; g += 1) {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${g * RESULTS_PER_PAGE}&num=${RESULTS_PER_PAGE}&hl=${locale.language}&gl=${locale.country}`, { waitUntil: "networkidle" });

            let results: RawResult[] = [];
            for (let retry = 0; retry < 3 && !results.length; retry += 1) {
                try {
                    await page.waitForSelector("h3", { timeout: 8000 });
                    await page.waitForTimeout(1500);
                    results = await page.evaluate(() =>
                        Array.from(document.querySelectorAll("h3"))
                            .map((h3) => {
                                let a: HTMLAnchorElement | null = h3.closest("a");
                                if (!a) {
                                    let p: HTMLElement | null = h3.parentElement;
                                    for (let j = 0; j < 5 && p; j += 1, p = p.parentElement) {
                                        if (p instanceof HTMLAnchorElement) {
                                            a = p;
                                            break;
                                        }
                                        const sub = p.querySelector<HTMLAnchorElement>("a[href]");
                                        if (sub?.contains(h3)) {
                                            a = sub;
                                            break;
                                        }
                                    }
                                }
                                if (!a || !a.href.startsWith("http") || a.href.includes("google.")) return null;
                                const title = h3.innerText.trim();
                                let snippet = "";
                                let c: HTMLElement | null = a.parentElement;
                                for (let j = 0; j < 6 && c; j += 1, c = c.parentElement) {
                                    const txt = c.innerText ?? "";
                                    if (txt.length > title.length + 50) {
                                        snippet = (txt.split("\n").find((l) => l.length > 30 && !l.includes(title.slice(0, 20))) ?? "").trim().slice(0, 300);
                                        if (snippet) break;
                                    }
                                }
                                return { url: a.href, domain: new URL(a.href).hostname.replace(/^www\./, ""), title, snippet };
                            })
                            .filter((r): r is RawResult => r !== null)
                    );
                } catch {
                    /* retry below */
                }
                if (!results.length && retry < 2) await page.reload({ waitUntil: "networkidle" });
            }
            if (!results.length) break;

            for (const r of results) {
                const entry: SerpResult = { ...r, position: all.length + 1 };
                all.push(entry);
                if (!found && sameSite(r.domain.toLowerCase(), target)) found = { ...entry, page: g + 1 };
            }
            if (!found) await page.waitForTimeout(2000 + Math.random() * 2000);
        }

        await closeQuietly(browser);
        browser = null;

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position ?? null,
                page: found?.page ?? null,
                title: found?.title ?? "",
                snippet: found?.snippet ?? "",
                competitors: all.filter((r) => !sameSite(r.domain.toLowerCase(), target)).slice(0, 10),
                totalResultsScanned: all.length,
            },
        };
    } catch (err) {
        await closeQuietly(browser);
        const message = (err as Error).message;
        console.error("[rank] check failed:", message);
        return { success: false, error: message };
    }
}
