import { Router } from "express";
import { getTheme, patchTheme } from "../controllers/userThemeController";

const router = Router();

router.get("/theme", getTheme);
router.patch("/theme", patchTheme);

export default router;
