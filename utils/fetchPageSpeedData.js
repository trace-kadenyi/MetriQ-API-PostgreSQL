const axios = require("axios");

// fetch pagespeed data func
const fetchPageSpeedData = async (url, strategy) => {
  const API_KEY = process.env.PAGESPEED_API_KEY;
  const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const requestUrl = `${API_URL}?url=${url}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices&key=${API_KEY}`;

  try {
    const res = await axios.get(requestUrl);
    const data = res.data;
    // results
    const categories = data.lighthouseResult.categories;
    const audits = data.lighthouseResult.audits;
    // scores
    const scores = {
      performance: Math.round(categories.performance?.score * 100),
      accessibility: Math.round(categories.accessibility?.score * 100),
      seo: Math.round(categories.seo?.score * 100),
      bestPractices: Math.round(categories["best-practices"]?.score * 100),
    };
    // metrics
    const getMetric = (key) => ({
      value: audits[key]?.displayValue || "N/A",
      status:
        audits[key]?.scoreDisplayMode === "numeric"
          ? audits[key]?.score >= 0.9
            ? "good"
            : audits[key]?.score >= 0.5
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
    const performanceSuggestions = getUserFriendlySuggestions(audits);

    return { scores, metrics, suggestions: performanceSuggestions };
  } catch (err) {
    console.error(
      `Failed to fetch PageSpeed data for ${url} (${strategy})`,
      err.response?.data || err.message
    );
    throw err;
  }
};

module.exports = fetchPageSpeedData;
