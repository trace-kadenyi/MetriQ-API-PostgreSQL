const express = require("express");
const {
  createComparison,
  getComparisonsByAnonId,
} = require("../controllers/comparisonController");

const router = express.Router();

router.post("/compare", createComparison);

module.exports = router;
