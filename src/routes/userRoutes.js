const express = require("express");
const router = express.Router();
const { getTheme, patchTheme } = require("../controllers/userThemeController");

// GET /api/user/theme
router.get("/theme", getTheme);

// PATCH /api/user/theme
router.patch("/theme", patchTheme);

module.exports = router;
