import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.post("/check", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body as { url?: string };

  if (!url) {
    res.status(400).json({ success: false, message: "No URL provided." });
    return;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ success: false, message: "Invalid URL format." });
    return;
  }

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const code = response.status;

    if (code >= 200 && code < 300) {
      res.json({ success: true, status: code });
      return;
    }
    if (code >= 500) {
      res
        .status(500)
        .json({
          success: false,
          status: code,
          message: "Remote server error.",
        });
      return;
    }
    res
      .status(400)
      .json({
        success: false,
        status: code,
        message: "URL is unreachable or does not exist.",
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("[url/check] network error:", message);
    res
      .status(400)
      .json({
        success: false,
        status: "network",
        message: "URL is unreachable or does not exist.",
      });
  }
});

export default router;
