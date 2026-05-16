import mongoose from "mongoose";
import { env } from "./env.ts";

let ready: Promise<typeof mongoose> | null = null;

/** Connect once; safe to call per request on serverless. */
export function connectDB() {
    if (!ready) {
        mongoose.connection.on("connected", () => console.log("[db] connected"));
        mongoose.connection.on("error", (err) => console.error("[db] error:", err.message));
        ready = mongoose.connect(env.mongoUri).catch((err) => {
            ready = null;
            throw err;
        });
    }
    return ready;
}
