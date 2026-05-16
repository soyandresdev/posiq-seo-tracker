import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
    {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const conversationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        analysisId: { type: Schema.Types.ObjectId, ref: "Analysis", required: true },
        messages: [messageSchema],
    },
    { timestamps: true }
);

conversationSchema.index({ userId: 1, analysisId: 1 }, { unique: true });

export type ConversationShape = InferSchemaType<typeof conversationSchema>;
export type ConversationDoc = HydratedDocument<ConversationShape>;
export const Conversation = model("Conversation", conversationSchema);
