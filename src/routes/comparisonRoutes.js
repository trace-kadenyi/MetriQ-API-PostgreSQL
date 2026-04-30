const express = require("express");
const router = express.Router();

const { createComparison } = require("../controllers/comparisonController");

// post route
router.post("/compare", createComparison);

module.exports = router;
