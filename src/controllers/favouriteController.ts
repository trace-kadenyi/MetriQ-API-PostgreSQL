import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const MAX_FAVOURITES = 5;

const getAnonId = (req: Request): string | null =>
  req.header("x-anon-id") ?? null;

// GET /api/favourites
export const getFavourites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const anonId = getAnonId(req);

  if (!anonId) {
    res
      .status(400)
      .json({ success: false, message: "x-anon-id header required" });
    return;
  }

  try {
    const favourites = await prisma.favourite.findMany({
      where: { anonId },
      include: { url: { select: { url: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      success: true,
      favourites: favourites.map((f) => f.url.url),
    });
  } catch (err) {
    console.error("getFavourites error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving favourites" });
  }
};

// POST /api/favourites/toggle
export const toggleFavourite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const anonId = getAnonId(req);
  const { url } = req.body as { url?: string };

  if (!anonId) {
    res
      .status(400)
      .json({ success: false, message: "x-anon-id header required" });
    return;
  }

  if (!url || typeof url !== "string") {
    res
      .status(400)
      .json({ success: false, message: "Missing or invalid URL." });
    return;
  }

  try {
    // 1. Upsert the URL row
    const urlRow = await prisma.url.upsert({
      where: { url: url.trim() },
      create: { url: url.trim() },
      update: {},
    });

    // 2. Check if already favourited
    const existing = await prisma.favourite.findFirst({
      where: { anonId, urlId: urlRow.id },
    });

    if (existing) {
      // Already saved — remove it (toggle off)
      await prisma.favourite.delete({ where: { id: existing.id } });
    } else {
      // Not saved — check cap before adding
      const count = await prisma.favourite.count({ where: { anonId } });

      if (count >= MAX_FAVOURITES) {
        res.status(400).json({
          success: false,
          message: `You can only save up to ${MAX_FAVOURITES} favourites.`,
        });
        return;
      }

      await prisma.favourite.create({
        data: { anonId, urlId: urlRow.id },
      });
    }

    // 3. Return updated list
    const updated = await prisma.favourite.findMany({
      where: { anonId },
      include: { url: { select: { url: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      success: true,
      favourites: updated.map((f) => f.url.url),
    });
  } catch (err) {
    console.error("toggleFavourite error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error toggling favourite" });
  }
};
