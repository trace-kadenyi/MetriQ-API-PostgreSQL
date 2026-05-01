import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { fetchPageSpeedData } from "../utils/fetchPageSpeedData";
import { PageSpeedResult } from "../types";
import { Prisma } from "@prisma/client";

interface ReportRawData {
  scores: {
    mobile: PageSpeedResult["scores"];
    desktop: PageSpeedResult["scores"];
  };
  metrics: {
    mobile: PageSpeedResult["metrics"];
    desktop: PageSpeedResult["metrics"];
  };
  suggestions: {
    mobile: PageSpeedResult["suggestions"];
    desktop: PageSpeedResult["suggestions"];
  };
}

// POST /api/url/report
export const createReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawUrl = req.body.url as string | undefined;

  if (!rawUrl) {
    res.status(400).json({ success: false, message: "Missing URL." });
    return;
  }

  const url = rawUrl.trim();

  try {
    // 1. Fetch mobile and desktop data in parallel
    const [mobileResult, desktopResult] = await Promise.all([
      fetchPageSpeedData(url, "mobile"),
      fetchPageSpeedData(url, "desktop"),
    ]);

    // 2. Build the blob that goes into the rawData JSONB column
    const rawData: ReportRawData = {
      scores: {
        mobile: mobileResult.scores,
        desktop: desktopResult.scores,
      },
      metrics: {
        mobile: mobileResult.metrics,
        desktop: desktopResult.metrics,
      },
      suggestions: {
        mobile: mobileResult.suggestions,
        desktop: desktopResult.suggestions,
      },
    };

    // 3. Upsert the URL row
    // If this URL has been audited before, reuse its row.
    // If it's new, create a row for it.
    const urlRow = await prisma.url.upsert({
      where: { url },
      create: { url },
      update: {},
    });

    // 4. Create the report row
    await prisma.report.create({
      data: {
        urlId: urlRow.id,
        rawData: rawData as unknown as Prisma.InputJsonValue,
      },
    });

    // 5. Enforce the 5-report cap
    // Fetch all report IDs for this URL, oldest first
    const allReports = await prisma.report.findMany({
      where: { urlId: urlRow.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    // If over 5, delete the oldest ones
    if (allReports.length > 5) {
      const idsToDelete = allReports
        .slice(0, allReports.length - 5)
        .map((r) => r.id);

      await prisma.report.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    // 6. Return the latest reports for this URL
    const reports = await prisma.report.findMany({
      where: { urlId: urlRow.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(201).json({ success: true, url, reports });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("createReport error:", errMessage);

    if (errMessage === "No PageSpeed data available") {
      res
        .status(400)
        .json({ success: false, message: "No PageSpeed data available" });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error generating report",
      error: errMessage,
    });
  }
};

// GET /api/url/report?url=...
export const getReportsByUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawUrl = req.query.url as string | undefined;

  if (!rawUrl) {
    res.status(400).json({ success: false, message: "Missing url parameter" });
    return;
  }

  const url = rawUrl.trim();

  try {
    const urlRow = await prisma.url.findUnique({
      where: { url },
      include: {
        reports: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!urlRow) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }

    res.status(200).json({ success: true, url, reports: urlRow.reports });
  } catch (err) {
    console.error("getReportsByUrl error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving report" });
  }
};
