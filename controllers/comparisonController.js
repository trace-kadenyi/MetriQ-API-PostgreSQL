const fetchPageSpeedData = require("../utils/fetchPageSpeedData");

/* same helper style you use in favourites */
const extractAnonId = (req) => req.header("x-anon-id") || null;

/* small util: just scores, no metrics/suggestions */
const fetchScoresOnly = async (url) => {
  const [mobile, desktop] = await Promise.all([
    fetchPageSpeedData(url, "mobile"),
    fetchPageSpeedData(url, "desktop"),
  ]);
  return { mobile: mobile.scores, desktop: desktop.scores };
};

/* POST /api/compare  */
const createComparison = async (req, res) => {
  try {
    const { userSiteUrl, competitors = [] } = req.body || {};

    if (!userSiteUrl || competitors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userSiteUrl and at least one competitor are required.",
      });
    }

    const userScores = await fetchScoresOnly(userSiteUrl.trim());

    const comps = [];
    for (const { url, label } of competitors.slice(0, 3)) {
      const scores = await fetchScoresOnly(url.trim());
      comps.push({ url: url.trim(), label, scores });
    }

    // 🚫 no DB save
    res.json({
      success: true,
      comparison: {
        userSiteUrl: userSiteUrl.trim(),
        userScores,
        competitors: comps,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Transient comparison error:", err.message);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

module.exports = { createComparison };
