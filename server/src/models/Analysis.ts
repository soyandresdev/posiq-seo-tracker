import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const issueSchema = new Schema(
    {
        severity: { type: String, enum: ["critical", "warning", "info"], required: true },
        category: { type: String, required: true },
        message: { type: String, required: true },
        recommendation: { type: String, required: true },
        impact: { type: String, enum: ["high", "medium", "low"], default: "medium" },
        effort: { type: String, enum: ["quick", "medium", "large"], default: "medium" },
        snippet: { type: String, default: "" },
    },
    { _id: false }
);

const checkSchema = new Schema(
    {
        id: { type: String, required: true },
        label: { type: String, required: true },
        category: { type: String, enum: ["seo", "performance", "accessibility", "bestPractices"], required: true },
        passed: { type: Boolean, required: true },
        detail: { type: String, default: "" },
    },
    { _id: false }
);

const analysisSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        url: { type: String, required: true },
        summary: { type: String, default: "" },
        overallScore: { type: Number, min: 0, max: 100, default: 0 },
        categories: {
            seo: { type: Number, default: 0 },
            performance: { type: Number, default: 0 },
            accessibility: { type: Number, default: 0 },
            bestPractices: { type: Number, default: 0 },
        },
        metaData: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            canonical: { type: String, default: "" },
            robots: { type: String, default: "" },
            ogTitle: { type: String, default: "" },
            ogDescription: { type: String, default: "" },
            ogImage: { type: String, default: "" },
            twitterCard: { type: String, default: "" },
            viewport: { type: String, default: "" },
            charset: { type: String, default: "" },
        },
        headings: {
            h1: { type: Number, default: 0 },
            h2: { type: Number, default: 0 },
            h3: { type: Number, default: 0 },
            h4: { type: Number, default: 0 },
            h5: { type: Number, default: 0 },
            h6: { type: Number, default: 0 },
            h1Texts: [String],
        },
        links: {
            internal: { type: Number, default: 0 },
            external: { type: Number, default: 0 },
            broken: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        images: {
            total: { type: Number, default: 0 },
            missingAlt: { type: Number, default: 0 },
            withAlt: { type: Number, default: 0 },
        },
        keywords: [{ word: String, count: Number, density: Number }],
        issues: [issueSchema],
        checks: [checkSchema],
        loadTime: { type: Number, default: 0 },
        pageSize: { type: Number, default: 0 },
        wordCount: { type: Number, default: 0 },
        status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    },
    { timestamps: true }
);

export type AnalysisShape = InferSchemaType<typeof analysisSchema>;
export type AnalysisDoc = HydratedDocument<AnalysisShape>;
export const Analysis = model("Analysis", analysisSchema);
