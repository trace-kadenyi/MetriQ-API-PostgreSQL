const express = require("express");
const router = express.Router();
const {
  createOrUpdateReport,
  getReport,
  createReport,
  getReportsByUrl,
} = require("../controllers/reportController");

router.post("/report", createReport);

router.get("/report", getReportsByUrl);

module.exports = router;
