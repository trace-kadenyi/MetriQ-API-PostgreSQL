import axios from "axios";
import { getUserFriendlySuggestions } from "./getUserFriendlySuggestions";
import { ScoreBlock, MetricEntry, Suggestion, PageSpeedResult } from "../types";

export const fetchPageSpeedData = async (
  url: string,
  strategy: "mobile" | "desktop",
): Promise<PageSpeedResult> => {
  const API_KEY = process.env.PAGESPEED_API_KEY as string;
  const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const requestUrl = `${API_URL}?url=${url}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices&key=${API_KEY}`;

  try {
    const res = await axios.get(requestUrl);
    const lighthouseResult = res.data?.lighthouseResult;

    if (!lighthouseResult?.categories || !lighthouseResult?.audits) {
      const err = new Error("No PageSpeed data available") as Error & {
        code: number;
      };
      err.code = 204;
      throw err;
    }

    const scores: ScoreBlock = {
      performance: Math.round(
        (lighthouseResult.categories.performance?.score ?? 0) * 100,
      ),
      accessibility: Math.round(
        (lighthouseResult.categories.accessibility?.score ?? 0) * 100,
      ),
      seo: Math.round((lighthouseResult.categories.seo?.score ?? 0) * 100),
      bestPractices: Math.round(
        (lighthouseResult.categories["best-practices"]?.score ?? 0) * 100,
      ),
    };

    const getMetric = (key: string): MetricEntry => {
      const audit = lighthouseResult.audits[key];
      return {
        value: audit?.displayValue ?? "N/A",
        status:
          audit?.scoreDisplayMode === "numeric"
            ? audit.score >= 0.9
              ? "good"
              : audit.score >= 0.5
                ? "average"
                : "poor"
            : "n/a",
      };
    };

    const metrics: Record<string, MetricEntry> = {
      "First Contentful Paint": getMetric("first-contentful-paint"),
      "Largest Contentful Paint": getMetric("largest-contentful-paint"),
      "First Input Delay": getMetric("interactive"),
      "Cumulative Layout Shift": getMetric("cumulative-layout-shift"),
      "Speed Index": getMetric("speed-index"),
      "Total Blocking Time": getMetric("total-blocking-time"),
    };

    const suggestions = getUserFriendlySuggestions(lighthouseResult.audits);

    return { scores, metrics, suggestions };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes("HTTPS") ||
      message.includes("Blocked") ||
      message.includes("Unable to process") ||
      message.includes("No PageSpeed data available")
    ) {
      const friendly = new Error("No PageSpeed data available") as Error & {
        code: number;
      };
      friendly.code = 204;
      throw friendly;
    }
    throw err;
  }
};
