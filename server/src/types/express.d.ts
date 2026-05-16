declare global {
    namespace Express {
        interface Request {
            /** Set by the auth middleware. */
            userId?: string;
        }
    }
}
export {};
