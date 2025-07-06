const Report = require("../models/ReportSchema");
const fetchPageSpeedData = require("../utils/fetchPageSpeedData");

// create report func
const createReport = async (req, res) => {
  try {
    const rawUrl = req.body.url;
    if (!rawUrl) {
      return res.status(400).json({ success: false, message: "Missing URL." });
    }

    const url = rawUrl.trim();

    // Fetch data
    const [mobileResult, desktopResult] = await Promise.all([
      fetchPageSpeedData(url, "mobile"),
      fetchPageSpeedData(url, "desktop"),
    ]);

    // Build new report entry
    const newReportEntry = {
      scores: {
        mobile: mobileResult.scores,
        desktop: desktopResult.scores,
      },
      metrics: {
        mobile: mobileResult.metrics,
        desktop: desktopResult.metrics,
      },
      suggestions: {
        mobile: mobileResult.suggestions,
        desktop: desktopResult.suggestions,
      },
    };

    // Find existing document
    let existing = await Report.findOne({ url });

    if (!existing) {
      // If no report exists for this URL, create new document
      const newReport = new Report({
        url,
        reports: [newReportEntry],
      });
      await newReport.save();
      return res.status(201).json({ success: true, report: newReport });
    }

    // Push the new entry and keep only the latest 5
    existing.reports.push(newReportEntry);
    if (existing.reports.length > 5) {
      existing.reports.shift(); // Remove oldest
    }

    await existing.save();

    res.status(200).json({ success: true, report: existing });
  } catch (err) {
    console.error("Failed to create report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error generating report",
      error: err.message,
    });
  }
};

// get reports by url func
const getReportsByUrl = async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Missing url parameter" });
    }

    const url = rawUrl.trim();

    const report = await Report.findOne({ url });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error("Failed to fetch report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving report",
      error: err.message,
    });
  }
};

module.exports = { createReport, getReportsByUrl };
