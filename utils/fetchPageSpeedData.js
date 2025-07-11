const axios = require("axios");

const getUserFriendlySuggestions = require("./getUserFriendlySuggestions");

// fetch pagespeed data func
const fetchPageSpeedData = async (url, strategy) => {
  const API_KEY = process.env.PAGESPEED_API_KEY;
  const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const requestUrl = `${API_URL}?url=${url}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices&key=${API_KEY}`;

  try {
    const res = await axios.get(requestUrl);
    const data = res.data;

    const lighthouseResult = data.lighthouseResult;

    // ⛔️ Check for missing lighthouse data
    if (
      !lighthouseResult ||
      !lighthouseResult.categories ||
      !lighthouseResult.audits
    ) {
      const friendlyError = new Error("No PageSpeed data available");
      friendlyError.code = 204; // Custom signal
      throw friendlyError;
    }

    // scores
    const scores = {
      performance: Math.round(
        lighthouseResult.categories.performance?.score * 100
      ),
      accessibility: Math.round(
        lighthouseResult.categories.accessibility?.score * 100
      ),
      seo: Math.round(lighthouseResult.categories.seo?.score * 100),
      bestPractices: Math.round(
        lighthouseResult.categories["best-practices"]?.score * 100
      ),
    };

    // metrics
    const getMetric = (key) => ({
      value: lighthouseResult.audits[key]?.displayValue || "N/A",
      status:
        lighthouseResult.audits[key]?.scoreDisplayMode === "numeric"
          ? lighthouseResult.audits[key]?.score >= 0.9
            ? "good"
            : lighthouseResult.audits[key]?.score >= 0.5
            ? "average"
            : "poor"
          : "n/a",
    });

    const metrics = {
      "First Contentful Paint": getMetric("first-contentful-paint"),
      "Largest Contentful Paint": getMetric("largest-contentful-paint"),
      "First Input Delay": getMetric("interactive"),
      "Cumulative Layout Shift": getMetric("cumulative-layout-shift"),
      "Speed Index": getMetric("speed-index"),
      "Total Blocking Time": getMetric("total-blocking-time"),
    };

    // 🌟 Get Friendly Performance Suggestions
    const performanceSuggestions = getUserFriendlySuggestions(
      lighthouseResult.audits
    );

    return { scores, metrics, suggestions: performanceSuggestions };
  } catch (err) {
    console.error(
      `Failed to fetch PageSpeed data for ${url} (${strategy})`,
      err.response?.data || err.message
    );

    // 🧼 Convert common failure cases into friendly "no data" message
    const errMsg = err.response?.data?.error?.message || err.message;

    if (
      errMsg.includes("HTTPS") || // e.g. unsupported protocol
      errMsg.includes("Blocked") ||
      errMsg.includes("Unable to process request") ||
      errMsg.includes("No PageSpeed data available")
    ) {
      const friendlyError = new Error("No PageSpeed data available");
      friendlyError.code = 204;
      throw friendlyError;
    }

    // Re-throw for unexpected errors
    throw err;
  }
};

module.exports = fetchPageSpeedData;
