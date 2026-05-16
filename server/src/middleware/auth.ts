import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    try {
        const decoded = jwt.verify(header.slice(7), env.jwtSecret) as { id: string };
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
}
