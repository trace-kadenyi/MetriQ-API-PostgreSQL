const axios = require("axios");

const createAISummary = async (req, res) => {
  const { inputText } = req.body;
  if (!inputText) return res.status(400).json({ error: "No text" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a professional web performance auditor. Your job is to analyze site performance reports and generate insightful summaries with recommendations.",
          },
          {
            role: "user",
            content: `Summarize and analyze the following performance reports:

                ${inputText}

                Please:
                - Identify meaningful trends across the reports (e.g. improvements or regressions).
                - Highlight any inconsistencies between mobile and desktop performance.
                - Mention specific metrics that worsened or improved over time.
                - Give clear, actionable recommendations for improving performance, SEO, accessibility, or best practices.
                - Keep the summary clear and concise.`,
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "MetriQ Performance Analyzer",
        },
        timeout: 60000,
      },
    );

    const summary = response.data.choices?.[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    console.error("DeepSeek API error:", err.response?.data || err.message);

    // Check for timeout specifically
    if (err.code === "ECONNABORTED" && err.message.includes("timeout")) {
      return res.status(504).json({
        error: "TIMEOUT",
        message: "AI analysis is taking too long. Please try with less data.",
      });
    }

    // Check for network errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message:
          "AI service is temporarily unavailable. Please try again later.",
      });
    }

    // API-specific errors
    if (err.response?.status === 429) {
      return res.status(429).json({
        error: "QUOTA_EXCEEDED",
        message: "AI quota exceeded. Please try again tomorrow.",
      });
    }

    if (err.response?.status === 401) {
      return res.status(401).json({
        error: "INVALID_API_KEY",
        message: "Invalid API key. Please check your OpenRouter settings.",
      });
    }

    // Model-specific errors (e.g., model not found)
    if (err.response?.status === 404) {
      return res.status(404).json({
        error: "MODEL_NOT_FOUND",
        message: "The AI model is not available. Please try a different model.",
      });
    }

    // Generic error
    res.status(500).json({
      error: "AI_SUMMARIZATION_FAILED",
      message: "AI summarization failed. Please try again.",
      details: err.message,
    });
  }
};

module.exports = {
  createAISummary,
};
