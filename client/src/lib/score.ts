/** Color token for a 0–100 score. */
export function scoreTone(v: number) {
    return v >= 80 ? "var(--success)" : v >= 50 ? "var(--warning)" : "var(--danger)";
}

export function scoreClass(v: number) {
    return v >= 80 ? "score-good" : v >= 50 ? "score-medium" : "score-poor";
}
