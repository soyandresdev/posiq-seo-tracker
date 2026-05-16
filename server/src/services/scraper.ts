import type { Browser } from "playwright-core";
import { closeQuietly, openPage } from "./browser.ts";
import type { Result, ScrapedData } from "../types/api.ts";

/** Render a URL in a real browser and read SEO-relevant facts from the live DOM. */
export async function scrapeUrl(url: string): Promise<Result<ScrapedData>> {
    let browser: Browser | null = null;
    try {
        const opened = await openPage(30_000);
        browser = opened.browser;
        const { page } = opened;

        const started = Date.now();
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        const loadTime = Date.now() - started;
        await page.waitForTimeout(2000);

        const data = await page.evaluate(() => {
            const meta = (name: string) => {
                const el = document.querySelector(`meta[name="${name}"]`) ?? document.querySelector(`meta[property="${name}"]`);
                return el?.getAttribute("content") ?? "";
            };
            const count = (sel: string) => document.querySelectorAll(sel).length;
            const h1Texts = Array.from(document.querySelectorAll("h1")).map((el) => el.textContent?.trim() ?? "");

            const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
            let internal = 0;
            let external = 0;
            for (const a of anchors) {
                try {
                    if (a.href.startsWith("mailto:") || a.href.startsWith("tel:")) continue;
                    if (new URL(a.href).hostname === window.location.hostname) internal += 1;
                    else external += 1;
                } catch {
                    /* ignore malformed hrefs */
                }
            }
            const images = Array.from(document.querySelectorAll("img"));
            const missingAlt = images.filter((img) => !img.alt?.trim()).length;
            const bodyText = document.body?.innerText ?? "";

            return {
                metaData: {
                    title: document.title ?? "",
                    description: meta("description"),
                    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? "",
                    robots: meta("robots"),
                    ogTitle: meta("og:title"),
                    ogDescription: meta("og:description"),
                    ogImage: meta("og:image"),
                    twitterCard: meta("twitter:card"),
                    viewport: meta("viewport"),
                    charset: document.querySelector("meta[charset]")?.getAttribute("charset") ?? "",
                },
                headings: { h1: count("h1"), h2: count("h2"), h3: count("h3"), h4: count("h4"), h5: count("h5"), h6: count("h6"), h1Texts },
                links: { internal, external, total: anchors.length },
                images: { total: images.length, missingAlt, withAlt: images.length - missingAlt },
                wordCount: bodyText.split(/\s+/).filter(Boolean).length,
                pageSize: document.documentElement.outerHTML.length,
                bodyText: bodyText.slice(0, 3000),
            };
        });

        await closeQuietly(browser);
        browser = null;
        return { success: true, data: { ...data, url, loadTime, statusCode: response?.status() ?? 0 } };
    } catch (err) {
        await closeQuietly(browser);
        const message = (err as Error).message;
        console.error("[scraper] failed:", message);
        return { success: false, error: message };
    }
}
