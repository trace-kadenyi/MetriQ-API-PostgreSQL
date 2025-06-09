const express = require("express");
const router = express.Router();
const {
  createOrUpdateReport,
  getReport,
} = require("../controllers/reportController");

router.post("/report", createOrUpdateReport);

router.get("/report", getReport);

module.exports = router;
