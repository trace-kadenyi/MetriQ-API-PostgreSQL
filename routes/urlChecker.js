const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/check", async (req, res) => {
  const { url } = req.body;

  /* ---------- basic validations ---------- */
  if (!url) {
    return res.status(400).json({
      success: false,
      message: "No URL provided.",
    });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid URL format.",
    });
  }

  /* ---------- reachability probe ---------- */
  try {
    /*
     *  validateStatus: () => true
     *  lets us receive *all* HTTP responses
     *  (Axios normally rejects 4xx/5xx).
     */
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const code = response.status;

    if (code >= 200 && code < 300) {
      // reachable and healthy
      return res.json({ success: true, status: code });
    }

    if (code >= 500) {
      // remote server error → 500 back to front‑end
      return res.status(500).json({
        success: false,
        status: code,
        message: "Remote server error.",
      });
    }

    // Any other HTTP problem (404, 403, etc.)
    return res.status(400).json({
      success: false,
      status: code,
      message: "URL is unreachable or does not exist.",
    });
  } catch (err) {
    // Network/DNS/timeout
    console.error("[url/check] network error:", err.message);
    return res.status(400).json({
      success: false,
      status: "network",
      message: "URL is unreachable or does not exist.",
    });
  }
});

module.exports = router;
