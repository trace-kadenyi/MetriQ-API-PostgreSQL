const Report = require("../models/ReportSchema");
const fetchPageSpeedData = require("../utils/fetchPageSpeedData");

const createOrUpdateReport = async (req, res) => {
  try {
    const { url } = req.body;

    const [mobileResult, desktopResult] = await Promise.all([
      fetchPageSpeedData(url, "mobile"),
      fetchPageSpeedData(url, "desktop"),
    ]);

    const updatedReport = await Report.findOneAndUpdate(
      { url },
      {
        url,
        scores: {
          mobile: mobileResult.scores,
          desktop: desktopResult.scores,
        },
        metrics: {
          mobile: mobileResult.metrics,
          desktop: desktopResult.metrics,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      report: updatedReport,
    });
    console.log("Updated or created report:", updatedReport);
  } catch (err) {
    console.error("Failed to create/update report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching PageSpeed data",
      error: err.message,
    });
  }
};

module.exports = { createOrUpdateReport };
