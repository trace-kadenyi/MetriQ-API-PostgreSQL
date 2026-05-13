import { Router } from "express";

import {
  getFavourites,
  toggleFavourite,
} from "../controllers/favouriteController";

const router = Router();

// get route
router.get("/", getFavourites);
// post route
router.post("/toggle", toggleFavourite);

export default router;
