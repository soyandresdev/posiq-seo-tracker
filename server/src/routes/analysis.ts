import { Router } from "express";
import { auth } from "../middleware/auth.ts";
import { wrap } from "../middleware/errors.ts";
import { analyzeUrl, deleteAnalysis, getAnalyses, getAnalysis } from "../controllers/analysis.ts";
import { clearChat, getChat, postChat } from "../controllers/chat.ts";

export const analysisRouter = Router();
analysisRouter.use(auth);
analysisRouter.post("/analyze", wrap(analyzeUrl));
analysisRouter.get("/list", wrap(getAnalyses));
analysisRouter.get("/:id", wrap(getAnalysis));
analysisRouter.delete("/:id", wrap(deleteAnalysis));
analysisRouter.get("/:id/chat", wrap(getChat));
analysisRouter.post("/:id/chat", wrap(postChat));
analysisRouter.delete("/:id/chat", wrap(clearChat));
