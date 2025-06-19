const axios = require("axios");

const getUserFriendlySuggestions = (audits) => {
  const suggestionMap = {
    "render-blocking-resources":
      "Remove scripts or styles that delay page display.",
    "unminified-javascript":
      "Minify JavaScript to reduce load size and parsing time.",
    "unused-css-rules": "Remove unused CSS to shrink page size.",
    "uses-webp-images":
      "Use modern image formats like WebP for faster loading.",
    "uses-optimized-images": "Compress images to improve load speed.",
    "uses-responsive-images":
      "Use images that adapt to screen sizes for better performance.",
    "efficient-animated-content": "Avoid large animated content like GIFs.",
    "legacy-javascript": "Update legacy JavaScript libraries to improve speed.",
    "total-blocking-time":
      "Reduce long-running JavaScript tasks to improve responsiveness.",
    "uses-long-cache-ttl": "Enable browser caching to speed up repeat visits.",
    "time-to-interactive":
      "Page takes a long time to become usable — reduce script execution.",
    "speed-index":
      "Speed Index measures how quickly content is visually displayed.",
    "first-contentful-paint":
      "Time taken for the first visible content — aim for < 2s.",
    "largest-contentful-paint":
      "Delay in rendering main content — optimize media and scripts.",
    "cumulative-layout-shift":
      "Elements move while loading — reserve space for them.",
    "uses-text-compression":
      "Compress text files like HTML, CSS, JS to improve load speed.",
    "modern-image-formats": "Use next-gen image formats like WebP or AVIF.",
    "offscreen-images":
      "Lazy-load images not immediately visible to reduce initial load.",
  };

  return Object.entries(audits)
    .filter(
      ([key, audit]) =>
        (audit?.scoreDisplayMode === "opportunity" ||
          audit?.scoreDisplayMode === "numeric") &&
        (audit?.displayValue || audit?.details?.overallSavingsMs)
    )
    .map(([key, audit]) => {
      const fallback =
        audit.title + (audit.displayValue ? ` — ${audit.displayValue}` : "");
      return {
        title: audit.title,
        score: audit.score ?? null,
        displayValue: audit.displayValue || null,
        description: suggestionMap[key] || audit.description || fallback,
      };
    });
};

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
