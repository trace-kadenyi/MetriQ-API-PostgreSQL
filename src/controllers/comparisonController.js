const fetchPageSpeedData = require("../utils/fetchPageSpeedData");

/* ---------- helper: just the scores ---------- */
const fetchScoresOnly = async (url) => {
  const [mobile, desktop] = await Promise.all([
    fetchPageSpeedData(url, "mobile"),
    fetchPageSpeedData(url, "desktop"),
  ]);
  return { mobile: mobile.scores, desktop: desktop.scores };
};

// create comparison
const createComparison = async (req, res) => {
  try {
    const { userSiteUrl, competitors = [] } = req.body || {};

    if (!userSiteUrl || competitors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userSiteUrl and at least one competitor are required.",
      });
    }

    // user site
    let userScores = null;
    try {
      userScores = await fetchScoresOnly(userSiteUrl.trim());
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: `Could not retrieve PageSpeed data for ${userSiteUrl}`,
      });
    }

    // competitors
    const settled = await Promise.allSettled(
      competitors.slice(0, 3).map((c) => {
        const safeUrl = (c.url || "").trim();
        if (!safeUrl) return Promise.reject(new Error("Missing URL"));
        return fetchScoresOnly(safeUrl);
      })
    );

    const comps = settled.map((result, i) => {
      const { url, label } = competitors[i];
      if (result.status === "fulfilled") {
        return {
          url: (url || "").trim(),
          label,
          scores: result.value,
          error: false,
        };
      }
      return {
        url: (url || "").trim(),
        label,
        scores: null,
        error: true,
        message: "Data not available",
      };
    });

    /* ---------- response ---------- */
    res.json({
      success: true,
      partial: comps.some((c) => c.error),
      comparison: {
        userSiteUrl: userSiteUrl.trim(),
        userScores,
        competitors: comps,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Transient comparison error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal error",
    });
  }
};

module.exports = { createComparison };
