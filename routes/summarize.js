const express = require("express");
const router = express.Router();

const { createAISummary } = require("../controllers/aiSummaryController");

// post route
router.post("/", createAISummary);

module.exports = router;
