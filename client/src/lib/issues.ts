import type { Issue } from "../types/api";

/** High impact and under thirty minutes of work. */
export function isQuickWin(i: Issue) {
    return i.impact === "high" && i.effort === "quick";
}
