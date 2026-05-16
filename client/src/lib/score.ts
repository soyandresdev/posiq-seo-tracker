/** Color token for a 0–100 score. */
export function scoreTone(v: number) {
    return v >= 80 ? "var(--color-success)" : v >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}

export function scoreClass(v: number) {
    return v >= 80 ? "score-good" : v >= 50 ? "score-medium" : "score-poor";
}

export function scoreLabel(v: number) {
    return v >= 80 ? "Good" : v >= 50 ? "Needs work" : "Poor";
}
