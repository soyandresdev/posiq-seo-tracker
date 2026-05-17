import { Router } from "express";
import { auth } from "../middleware/auth.ts";
import { wrap } from "../middleware/errors.ts";
import { getUser, login, register, updateSettings } from "../controllers/auth.ts";

export const authRouter = Router();
authRouter.post("/register", wrap(register));
authRouter.post("/login", wrap(login));
authRouter.get("/user", auth, wrap(getUser));
authRouter.patch("/settings", auth, wrap(updateSettings));
