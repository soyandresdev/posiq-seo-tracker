import { Router } from "express";
import { wrap } from "../middleware/errors.ts";
import { rankCheck } from "../controllers/cron.ts";

export const cronRouter = Router();
cronRouter.get("/rank-check", wrap(rankCheck));
