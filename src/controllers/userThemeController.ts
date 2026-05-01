import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/user/theme
export const getTheme = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    res.json({ theme: "light" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { theme: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ theme: user.theme });
  } catch (err) {
    console.error("getTheme error:", err);
    res.status(500).json({ message: "Error retrieving theme" });
  }
};

// PATCH /api/user/theme
export const patchTheme = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.query;
  const { theme } = req.body as { theme?: string };

  if (!userId || typeof userId !== "string") {
    res.status(401).json({ message: "userId required" });
    return;
  }

  if (!theme || !["light", "dark"].includes(theme)) {
    res
      .status(400)
      .json({ message: "Invalid theme. Must be 'light' or 'dark'." });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { theme },
      select: { theme: true },
    });

    res.json({ success: true, theme: user.theme });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    console.error("patchTheme error:", err);
    res.status(500).json({ message: "Error updating theme" });
  }
};
