import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        plan: { type: String, enum: ["free", "pro"], default: "free" },
        analysisCount: { type: Number, default: 0 },
        lastAnalysisDate: { type: Date, default: null },
        alerts: {
            rankDrop: { type: Boolean, default: true },
            dropThreshold: { type: Number, default: 3, min: 1, max: 50 },
            analysisDone: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

export type UserShape = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserShape>;
export const User = model("User", userSchema);

/** What the client is allowed to see. Never the password hash. */
export function publicUser(u: UserDoc, analysisCount: number) {
    return { id: u._id.toString(), name: u.name, email: u.email, plan: u.plan, analysisCount, alerts: { rankDrop: u.alerts?.rankDrop ?? true, dropThreshold: u.alerts?.dropThreshold ?? 3, analysisDone: u.alerts?.analysisDone ?? false } };
}
