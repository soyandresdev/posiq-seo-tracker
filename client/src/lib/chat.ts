import { BACKEND_URL } from "./config";

export type ChatMessage = { role: "user" | "assistant"; content: string; createdAt?: string };
export type ChatState = { messages: ChatMessage[]; used: number; limit: number };

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

export async function loadChat(analysisId: string): Promise<ChatState> {
    const res = await fetch(`${BACKEND_URL}/api/analysis/${analysisId}/chat`, { headers: auth() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message ?? "Could not load the conversation");
    return { messages: data.messages, used: data.used, limit: data.limit };
}

export async function clearChat(analysisId: string) {
    await fetch(`${BACKEND_URL}/api/analysis/${analysisId}/chat`, { method: "DELETE", headers: auth() });
}

/** Sends a message and streams the reply. Resolves with the updated quota. */
export async function streamChat(analysisId: string, message: string, onDelta: (text: string) => void, signal?: AbortSignal): Promise<{ used: number; limit: number }> {
    const res = await fetch(`${BACKEND_URL}/api/analysis/${analysisId}/chat`, {
        method: "POST",
        headers: { ...auth(), "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal,
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "The assistant is unavailable");
    }
    if (!res.body) throw new Error("No response stream");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result = { used: 0, limit: 0 };

    for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
            const line = ev.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            const payload = JSON.parse(line.slice(6)) as { delta?: string; done?: boolean; used?: number; limit?: number; error?: string };
            if (payload.error) throw new Error(payload.error);
            if (payload.delta) onDelta(payload.delta);
            if (payload.done) result = { used: payload.used ?? 0, limit: payload.limit ?? 0 };
        }
    }
    return result;
}
