import { Router } from "express";

import {
  getFavourites,
  toggleFavourite,
  claimFavourites,
} from "../controllers/favouriteController";

const router = Router();

// get route
router.get("/", getFavourites);
// post route
router.post("/toggle", toggleFavourite);
//handle transfer from anon to user
router.post("/claim", claimFavourites);

export default router;
