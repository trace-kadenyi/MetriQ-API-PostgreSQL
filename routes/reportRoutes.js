const express = require("express");
const router = express.Router();
const {
  createOrUpdateReport,
} = require("../controllers/reportController");

router.post("/report", createOrUpdateReport);

router.get("/report", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  try {
    const report = await Report.findOne({ url });

    if (!report) {
      return res.status(404).json({ success: false, message: "No report found for this URL" });
    }

    return res.status(200).json({ success: true, report });
  } catch (err) {
    console.error("Error fetching report:", err.message);
    return res.status(500).json({ success: false, message: "Error fetching report" });
  }
});


module.exports = router;
