const express = require("express");
const router = express.Router();

const {
  getFavourites,
  toggleFavourite,
  claimFavourites,
} = require("../controllers/favouriteController");

// get route
router.get("/", getFavourites);
// post route
router.post("/toggle", toggleFavourite);
//handle transfer from anon to user
router.post("/claim", claimFavourites);

module.exports = router;
