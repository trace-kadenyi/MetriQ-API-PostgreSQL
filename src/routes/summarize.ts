import { Router } from "express";

import { createAISummary } from "../controllers/aiSummaryController";

const router = Router();

// post route
router.post("/", createAISummary);

export default router;
