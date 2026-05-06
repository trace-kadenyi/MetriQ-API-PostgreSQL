import { Request, Response } from "express";
import axios, { AxiosError } from "axios";

export const createAISummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { inputText } = req.body as { inputText?: string };

  if (!inputText) {
    res.status(400).json({ error: "No text" });
    return;
  }

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
    const axiosErr = err as AxiosError;
    console.error(
      "DeepSeek API error:",
      axiosErr.response?.data || axiosErr.message,
    );

    // Check for timeout specifically
    if (
      axiosErr.code === "ECONNABORTED" &&
      axiosErr.message.includes("timeout")
    ) {
      res.status(504).json({
        error: "TIMEOUT",
        message: "AI analysis is taking too long. Please try with less data.",
      });
      return;
    }

    // Check for network errors
    if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
      res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message:
          "AI service is temporarily unavailable. Please try again later.",
      });
      return;
    }

    // API-specific errors
    if (axiosErr.response?.status === 429) {
      res.status(429).json({
        error: "QUOTA_EXCEEDED",
        message: "AI quota exceeded. Please try again tomorrow.",
      });
      return;
    }

    if (axiosErr.response?.status === 401) {
      res.status(401).json({
        error: "INVALID_API_KEY",
        message: "Invalid API key. Please check your OpenRouter settings.",
      });
      return;
    }

    // Model-specific errors (e.g., model not found)
    if (axiosErr.response?.status === 404) {
      res.status(404).json({
        error: "MODEL_NOT_FOUND",
        message: "The AI model is not available. Please try a different model.",
      });
      return;
    }

    // Generic error
    res.status(500).json({
      error: "AI_SUMMARIZATION_FAILED",
      message: "AI summarization failed. Please try again.",
      details: axiosErr.message,
    });
  }
};
