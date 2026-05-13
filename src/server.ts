import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

// Routes
import rootRouter from "./routes/root";
import urlCheckerRouter from "./routes/urlChecker";
import reportRouter from "./routes/reportRoutes";
import summarizeRouter from "./routes/summarize";
import favouritesRouter from "./routes/favouritesRoutes";
import comparisonRouter from "./routes/comparisonRoutes";
import competitorAiRouter from "./routes/competitorAiAnalysisRoute";
import userRouter from "./routes/userRoutes";

const app = express();
const PORT = process.env.PORT ?? 4000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route mounting
app.use("/", rootRouter);
app.use("/api/user", userRouter);
app.use("/api/url", urlCheckerRouter);
app.use("/api/url", reportRouter);
app.use("/api/summarize", summarizeRouter);
app.use("/api/favourites", favouritesRouter);
app.use("/api", comparisonRouter);
app.use("/api/ai/comparison", competitorAiRouter);

// Start
async function main() {
  await prisma.$connect();
  console.log("✅ Connected to PostgreSQL");

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
