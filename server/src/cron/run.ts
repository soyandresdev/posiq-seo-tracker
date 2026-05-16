// One-off runner: `npm run cron:rank`. Useful from any external scheduler.
import { connectDB } from "../config/db.ts";
import { runRankChecks } from "./rankTracking.ts";

await connectDB();
const summary = await runRankChecks();
console.log(summary);
process.exit(0);
