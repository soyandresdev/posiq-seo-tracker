import { chromium, type Browser, type Page } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import { env } from "../config/env.ts";

const bb = new Browserbase({ apiKey: env.browserbaseKey });

/** Open a Browserbase session and hand back the first page. Caller closes the browser. */
export async function openPage(navigationTimeout: number): Promise<{ browser: Browser; page: Page }> {
    const session = await bb.sessions.create({ browserSettings: { blockAds: true } });
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const page = browser.contexts()[0]?.pages()[0] ?? (await browser.newPage());
    page.setDefaultNavigationTimeout(navigationTimeout);
    return { browser, page };
}

export async function closeQuietly(browser: Browser | null) {
    if (!browser) return;
    try {
        await browser.close();
    } catch (err) {
        console.error("[browser] close failed:", (err as Error).message);
    }
}
