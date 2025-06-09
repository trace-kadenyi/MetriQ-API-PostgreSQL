const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/check", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "No URL provided." });
  }

  try {
    new URL(url);
  } catch {
    return res
      .status(400)
      .json({ success: false, message: "Invalid URL format." });
  }

  try {
    const response = await axios.get(url, { timeout: 5000 });
    return res.json({ success: true, status: response.status });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "URL is unreachable or does not exist.",
    });
  }
});

module.exports = router;
