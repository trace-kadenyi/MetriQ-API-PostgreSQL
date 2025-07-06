const axios = require("axios");

const createAISummary = async (req, res) => {
  const { inputText } = req.body;
  if (!inputText) return res.status(400).json({ error: "No text" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat:free",
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
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data.choices?.[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    console.error("DeepSeek API error:", err.response?.data || err.message);
    res.status(500).json({ error: "DeepSeek summarization failed" });
  }
};

module.exports = {
  createAISummary,
};
