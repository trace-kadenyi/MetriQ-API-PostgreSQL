const axios = require("axios");

const fetchPageSpeedData = async (url, strategy) => {
  const API_KEY = process.env.PAGESPEED_API_KEY;
  const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const requestUrl = `${API_URL}?url=${url}&strategy=${strategy}&category=performance&category=accessibility&category=seo&key=${API_KEY}`;

  try {
    const res = await axios.get(requestUrl);
    const data = res.data;

    const categories = data.lighthouseResult.categories;
    const audits = data.lighthouseResult.audits;

    const scores = {
      performance: Math.round(categories.performance?.score * 100),
      accessibility: Math.round(categories.accessibility?.score * 100),
      seo: Math.round(categories.seo?.score * 100),
    };

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
      FCP: getMetric("first-contentful-paint"),
      LCP: getMetric("largest-contentful-paint"),
      FID: getMetric("interactive"),
      CLS: getMetric("cumulative-layout-shift"),
      speedIndex: getMetric("speed-index"),
      TBT: getMetric("total-blocking-time"),
    };

    return { scores, metrics };
  } catch (err) {
    console.error(`Failed to fetch PageSpeed data for ${url} (${strategy})`, err.response?.data || err.message);
    throw err;
  }
};

module.exports = fetchPageSpeedData;
