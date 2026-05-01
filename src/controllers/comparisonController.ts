import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { fetchPageSpeedData } from "../utils/fetchPageSpeedData";
import { ScoreBlockPair, CompetitorInput } from "../types";
import { Prisma } from "@prisma/client";

const fetchScoresOnly = async (url: string): Promise<ScoreBlockPair> => {
  const [mobile, desktop] = await Promise.all([
    fetchPageSpeedData(url, "mobile"),
    fetchPageSpeedData(url, "desktop"),
  ]);
  return { mobile: mobile.scores, desktop: desktop.scores };
};

// POST /api/compare
export const createComparison = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userSiteUrl, competitors = [] } = req.body as {
    userSiteUrl?: string;
    competitors?: CompetitorInput[];
  };

  const anonId = req.header("x-anon-id") ?? null;

  if (!userSiteUrl || competitors.length === 0) {
    res.status(400).json({
      success: false,
      message: "userSiteUrl and at least one competitor are required.",
    });
    return;
  }

  try {
    // 1. Fetch user site scores
    let userScores: ScoreBlockPair;
    try {
      userScores = await fetchScoresOnly(userSiteUrl.trim());
    } catch {
      res.status(500).json({
        success: false,
        message: `Could not retrieve PageSpeed data for ${userSiteUrl}`,
      });
      return;
    }

    // 2. Fetch competitor scores (max 3, failures are soft)
    const settled = await Promise.allSettled(
      competitors.slice(0, 3).map((c) => {
        const safeUrl = (c.url ?? "").trim();
        if (!safeUrl) return Promise.reject(new Error("Missing URL"));
        return fetchScoresOnly(safeUrl);
      }),
    );

    // 3. Upsert each competitor URL row and build result objects
    const compResults = await Promise.all(
      settled.map(async (result, i) => {
        const { url, label } = competitors[i];
        const safeUrl = (url ?? "").trim();

        const urlRow = await prisma.url.upsert({
          where: { url: safeUrl },
          create: { url: safeUrl },
          update: {},
        });

        return {
          urlId: urlRow.id,
          url: safeUrl,
          label: label ?? null,
          scores:
            result.status === "fulfilled"
              ? (result.value as unknown as Prisma.InputJsonValue)
              : null,
          error: result.status === "rejected",
        };
      }),
    );

    // 4. Save the comparison and its competitor rows in one query
    const comparison = await prisma.comparison.create({
      data: {
        anonId,
        userSiteUrl: userSiteUrl.trim(),
        userScores: userScores as unknown as Prisma.InputJsonValue,
        competitors: {
          create: compResults.map(({ urlId, label, scores, error }) => ({
            urlId,
            label,
            scores: scores ?? Prisma.JsonNull,
            error,
          })),
        },
      },
      include: {
        competitors: {
          include: { url: true },
        },
      },
    });

    res.json({
      success: true,
      partial: compResults.some((c) => c.error),
      comparison: {
        id: comparison.id,
        userSiteUrl: comparison.userSiteUrl,
        userScores: comparison.userScores,
        competitors: comparison.competitors.map((c) => ({
          url: c.url.url,
          label: c.label,
          scores: c.scores,
          error: c.error,
        })),
        createdAt: comparison.createdAt,
      },
    });
  } catch (err) {
    console.error("createComparison error:", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};
