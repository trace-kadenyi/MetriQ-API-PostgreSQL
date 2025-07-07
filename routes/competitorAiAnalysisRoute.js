const express = require("express");
const router = express.Router();

const {
  createAICompetitorAnalysis,
} = require("../controllers/competitorAiAnalysisController");

// post route
router.post("/", createAICompetitorAnalysis);

module.exports = router;
