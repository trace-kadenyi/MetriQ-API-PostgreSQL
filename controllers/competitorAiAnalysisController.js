const axios = require("axios");

/**
 * POST /ai/comparison
 * Body:
 *   {
 *     comparison: {
 *       userSiteUrl: "https://…",
 *       userScores: { mobile:{…}, desktop:{…} },
 *       competitors: [
 *         { url:"https://…", label:"", scores:{ mobile:{…}, desktop:{…} } },
 *         …
 *       ]
 *     },
 *     format: "markdown" | "json"  // optional, default = markdown
 *   }
 */
const createAICompetitorAnalysis = async (req, res) => {
  const { comparison, format = "markdown" } = req.body ?? {};
  if (!comparison)
    return res.status(400).json({ error: "No comparison data supplied" });

  const describe = (label, scores) => {
    const { mobile, desktop } = scores;
    return [
      `→ ${label}`,
      `Mobile: Perf ${mobile.performance}, Acc ${mobile.accessibility}, SEO ${mobile.seo}, BP ${mobile.bestPractices}`,
      `Desktop: Perf ${desktop.performance}, Acc ${desktop.accessibility}, SEO ${desktop.seo}, BP ${desktop.bestPractices}`,
    ].join("\n");
  };

  const userLine = describe("User’s site", comparison.userScores);
  const compLines = comparison.competitors
    .filter((c) => c.scores && !c.error)
    .map((c) => describe(c.label || c.url, c.scores))
    .join("\n\n");

  const fullInput = [userLine, compLines].join("\n\n");

  // ---------- 2. Prompt ----------
  const messages = [
    {
      role: "system",
      content: [
        "You are an expert in Google Lighthouse/PageSpeed auditing.",
        "Compare the user’s website (first entry below) against the competitors.",
        "Output:",
        "1. Executive summary (≤ 4 sentences).",
        "2. Findings grouped by **Performance · Accessibility · SEO · Best Practices**.",
        "3. Priority‑ranked, actionable recommendations.",
        "4. Note any anomalies (e.g. mobile ≫ desktop performance).",
        `Return the answer in **${format.toUpperCase()}**.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        "Here are the scores (0‑100) for the user and their competitors:",
        "",
        fullInput,
      ].join("\n"),
    },
  ];

  // ---------- 3. DeepSeek call ----------
  try {
    const { data } = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat:free",
        messages,
        temperature: 0.25,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = data.choices?.[0]?.message?.content ?? "";
    res.json({ analysis, format });
  } catch (err) {
    const statusCode = err?.response?.status;
    const code = err?.response?.data?.error?.code;
    const message = err?.response?.data?.error?.message;

    console.error("DeepSeek API error:", err.response?.data || err.message);

    if (statusCode === 429 && code === "429") {
      return res.status(429).json({
        error: "RATE_LIMIT",
        message:
          "DeepSeek usage limit exceeded. Please try again tomorrow or upgrade your plan.",
      });
    }

    res.status(502).json({
      error: "AI competitor analysis failed",
      details: message || err.message,
    });
  }
};

module.exports = { createAICompetitorAnalysis };
