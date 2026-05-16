import { app } from "./app.ts";
import { env } from "./config/env.ts";
import { connectDB } from "./config/db.ts";
import { startRankTrackingCron } from "./cron/rankTracking.ts";

// Long-running process: connect, schedule the daily check, listen.
connectDB()
    .then(() => {
        if (!env.isVercel) startRankTrackingCron();
        app.listen(env.port, () => console.log(`[server] listening on http://localhost:${env.port}`));
    })
    .catch((err) => {
        console.error("[server] could not connect to MongoDB:", (err as Error).message);
        process.exit(1);
    });
