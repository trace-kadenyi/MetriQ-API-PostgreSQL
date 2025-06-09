const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

// create a new report
router.route("/").post(reportsController.createReport);

module.exports = router;