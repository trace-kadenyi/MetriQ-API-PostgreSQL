import { Router } from "express";

import { createReport, getReportsByUrl } from "../controllers/reportController";

const router = Router();

// post route
router.post("/report", createReport);
// get route
router.get("/report", getReportsByUrl);

export default router;
