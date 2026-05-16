import type { Request, Response } from "express";
import { CHAT_LIMITS, env } from "../config/env.ts";
import { Analysis } from "../models/Analysis.ts";
import { Conversation } from "../models/Conversation.ts";
import { User } from "../models/User.ts";
import { ai } from "../services/gemini.ts";
import { systemInstruction } from "../services/assistant.ts";

const MAX_MESSAGE = 2000;
const HISTORY_TURNS = 12;

async function load(req: Request) {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
    if (!analysis) return null;
    const conversation = (await Conversation.findOne({ userId: req.userId, analysisId: analysis._id })) ?? new Conversation({ userId: req.userId, analysisId: analysis._id, messages: [] });
    return { analysis, conversation };
}

async function limitFor(userId: string | undefined) {
    const user = await User.findById(userId).select("plan");
    return user?.plan === "pro" ? CHAT_LIMITS.pro : CHAT_LIMITS.free;
}

export async function getChat(req: Request, res: Response) {
    const found = await load(req);
    if (!found) return res.status(404).json({ success: false, message: "Analysis not found" });
    const limit = await limitFor(req.userId);
    const used = found.conversation.messages.filter((m) => m.role === "user").length;
    res.json({ success: true, messages: found.conversation.messages, used, limit });
}

export async function clearChat(req: Request, res: Response) {
    await Conversation.deleteOne({ userId: req.userId, analysisId: req.params.id });
    res.json({ success: true });
}

/** Streams the assistant's reply as Server-Sent Events, then persists both turns. */
export async function postChat(req: Request, res: Response) {
    const message = String((req.body as { message?: unknown } | undefined)?.message ?? "").trim();
    if (!message) return res.status(400).json({ success: false, message: "Write a message" });
    if (message.length > MAX_MESSAGE) return res.status(400).json({ success: false, message: `Keep it under ${MAX_MESSAGE} characters` });

    const found = await load(req);
    if (!found) return res.status(404).json({ success: false, message: "Analysis not found" });
    if (found.analysis.status !== "completed") return res.status(409).json({ success: false, message: "The report is not ready yet" });

    const limit = await limitFor(req.userId);
    const used = found.conversation.messages.filter((m) => m.role === "user").length;
    if (used >= limit) return res.status(429).json({ success: false, message: `You've used all ${limit} assistant messages for this report. Upgrade to Pro for more.` });

    const history = found.conversation.messages.slice(-HISTORY_TURNS * 2).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] }));

    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
    res.flushHeaders();
    const send = (payload: Record<string, unknown>) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

    let reply = "";
    try {
        const stream = await ai.models.generateContentStream({
            model: env.geminiModel,
            contents: [...history, { role: "user", parts: [{ text: message }] }],
            config: { systemInstruction: systemInstruction(found.analysis), temperature: 0.4 },
        });
        for await (const chunk of stream) {
            const delta = chunk.text ?? "";
            if (!delta) continue;
            reply += delta;
            send({ delta });
        }
        found.conversation.messages.push({ role: "user", content: message, createdAt: new Date() }, { role: "assistant", content: reply, createdAt: new Date() });
        await found.conversation.save();
        send({ done: true, used: used + 1, limit });
    } catch (err) {
        console.error("[chat] failed:", (err as Error).message);
        send({ error: "The assistant is unavailable right now. Try again in a moment." });
    } finally {
        res.end();
    }
}
