import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { ScoreBlock, ScoreBlockPair } from "../types";

interface CompetitorEntry {
  url: string;
  label?: string;
  scores: ScoreBlockPair | null;
  error: boolean;
}

interface ComparisonPayload {
  userScores: ScoreBlockPair;
  competitors: CompetitorEntry[];
}

// POST /api/ai/comparison
export const createAICompetitorAnalysis = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { comparison, format = "markdown" } = req.body as {
    comparison?: ComparisonPayload;
    format?: string;
  };

  if (!comparison) {
    res.status(400).json({ error: "No comparison data supplied" });
    return;
  }

  const describe = (label: string, scores: ScoreBlockPair): string => {
    const { mobile, desktop } = scores;
    return [
      `→ ${label}`,
      `Mobile: Perf ${mobile.performance}, Acc ${mobile.accessibility}, SEO ${mobile.seo}, BP ${mobile.bestPractices}`,
      `Desktop: Perf ${desktop.performance}, Acc ${desktop.accessibility}, SEO ${desktop.seo}, BP ${desktop.bestPractices}`,
    ].join("\n");
  };

  const userLine = describe("User's site", comparison.userScores);
  const compLines = comparison.competitors
    .filter((c) => c.scores && !c.error)
    .map((c) => describe(c.label ?? c.url, c.scores!))
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content: [
        "You are an expert in Google Lighthouse/PageSpeed auditing.",
        "Compare the user's website (first entry below) against the competitors.",
        "Output:",
        "1. Executive summary (≤ 4 sentences).",
        "2. Findings grouped by Performance · Accessibility · SEO · Best Practices.",
        "3. Priority-ranked, actionable recommendations.",
        "4. Note any anomalies (e.g. mobile >> desktop performance).",
        `Return the answer in **${format.toUpperCase()}**.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: `Here are the scores (0-100) for the user and their competitors:\n\n${[userLine, compLines].join("\n\n")}`,
    },
  ];

  try {
    const { data } = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages,
        temperature: 0.25,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "MetriQ Competitor Analysis",
        },
        timeout: 90000,
      },
    );

    const analysis = data.choices?.[0]?.message?.content ?? "";
    res.json({ analysis, format });
  } catch (err) {
    const axiosErr = err as AxiosError;
    console.error(
      "DeepSeek API error:",
      axiosErr.response?.data ?? axiosErr.message,
    );

    if (axiosErr.code === "ECONNABORTED") {
      res
        .status(504)
        .json({ error: "TIMEOUT", message: "AI analysis timed out." });
      return;
    }
    if (axiosErr.response?.status === 429) {
      res
        .status(429)
        .json({ error: "QUOTA_EXCEEDED", message: "AI quota exceeded." });
      return;
    }

    res
      .status(502)
      .json({
        error: "AI competitor analysis failed",
        details: axiosErr.message,
      });
  }
};
