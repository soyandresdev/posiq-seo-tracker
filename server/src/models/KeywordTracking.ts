import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const rankEntrySchema = new Schema(
    {
        date: { type: Date, required: true },
        position: { type: Number, default: null },
        page: { type: Number, default: null },
        title: { type: String, default: "" },
        snippet: { type: String, default: "" },
    },
    { _id: false }
);

const competitorSchema = new Schema(
    {
        position: { type: Number, required: true },
        url: { type: String, required: true },
        domain: { type: String, required: true },
        title: { type: String, default: "" },
        snippet: { type: String, default: "" },
    },
    { _id: false }
);

const keywordTrackingSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        keyword: { type: String, required: true, trim: true, lowercase: true },
        url: { type: String, required: true, trim: true },
        domain: { type: String, required: true },
        country: { type: String, default: "us" },
        language: { type: String, default: "en" },
        lastAlertAt: { type: Date, default: null },
        currentPosition: { type: Number, default: null },
        currentPage: { type: Number, default: null },
        bestPosition: { type: Number, default: null },
        positionChange: { type: Number, default: 0 },
        rankHistory: [rankEntrySchema],
        competitors: [competitorSchema],
        active: { type: Boolean, default: true },
        lastChecked: { type: Date, default: null },
        status: { type: String, enum: ["pending", "checking", "completed", "failed"], default: "pending" },
    },
    { timestamps: true }
);

keywordTrackingSchema.index({ userId: 1, keyword: 1, domain: 1, country: 1 }, { unique: true });

export type KeywordTrackingShape = InferSchemaType<typeof keywordTrackingSchema>;
export type KeywordTrackingDoc = HydratedDocument<KeywordTrackingShape>;
export const KeywordTracking = model("KeywordTracking", keywordTrackingSchema);
