const express = require("express");
const router = express.Router();

const {
  createReport,
  getReportsByUrl,
} = require("../controllers/reportController");

// post route
router.post("/report", createReport);
// get route
router.get("/report", getReportsByUrl);

module.exports = router;
