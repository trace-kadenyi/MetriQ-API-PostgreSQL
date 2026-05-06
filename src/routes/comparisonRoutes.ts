import { Router } from "express";

import { createComparison } from "../controllers/comparisonController";

const router = Router();

// post route
router.post("/compare", createComparison);

export default router;
