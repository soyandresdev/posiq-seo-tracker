import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Forward rejected promises to the error handler. */
export const wrap =
    (fn: AsyncHandler): RequestHandler =>
    (req, res, next) => {
        fn(req, res, next).catch(next);
    };

export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export function notFound(_req: Request, res: Response) {
    res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Server error";
    if (status >= 500) console.error("[error]", err);
    if (!res.headersSent) res.status(status).json({ success: false, message: status >= 500 ? "Server error" : message });
}
