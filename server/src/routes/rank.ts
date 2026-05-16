import { Router } from "express";
import { auth } from "../middleware/auth.ts";
import { wrap } from "../middleware/errors.ts";
import { addKeyword, deleteKeyword, getKeyword, getKeywords, refreshKeyword, toggleTracking } from "../controllers/rank.ts";

export const rankRouter = Router();
rankRouter.use(auth);
rankRouter.post("/add", wrap(addKeyword));
rankRouter.get("/list", wrap(getKeywords));
rankRouter.get("/:id", wrap(getKeyword));
rankRouter.post("/:id/refresh", wrap(refreshKeyword));
rankRouter.put("/:id/toggle", wrap(toggleTracking));
rankRouter.delete("/:id", wrap(deleteKeyword));
