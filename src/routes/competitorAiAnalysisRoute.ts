import { Router } from "express";
import { createAICompetitorAnalysis } from "../controllers/competitorAiAnalysisController";

const router = Router();

router.post("/", createAICompetitorAnalysis);

export default router;
