import { Router } from "express";
import { auth } from "../middleware/auth.ts";
import { wrap } from "../middleware/errors.ts";
import { addKeyword, addKeywordsBulk, deleteKeyword, getKeyword, getKeywords, getSummary, refreshKeyword, toggleTracking } from "../controllers/rank.ts";
import { COUNTRIES, LANGUAGES } from "../config/locales.ts";

export const rankRouter = Router();
rankRouter.use(auth);
rankRouter.get("/locales", (_req, res) => res.json({ success: true, countries: COUNTRIES, languages: LANGUAGES }));
rankRouter.post("/add", wrap(addKeyword));
rankRouter.post("/bulk", wrap(addKeywordsBulk));
rankRouter.get("/list", wrap(getKeywords));
rankRouter.get("/summary", wrap(getSummary));
rankRouter.get("/:id", wrap(getKeyword));
rankRouter.post("/:id/refresh", wrap(refreshKeyword));
rankRouter.put("/:id/toggle", wrap(toggleTracking));
rankRouter.delete("/:id", wrap(deleteKeyword));
