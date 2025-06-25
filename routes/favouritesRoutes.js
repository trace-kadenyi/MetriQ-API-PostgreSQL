// routes/favourite.routes.js
const express = require("express");
const router = express.Router();
const {
  getFavourites,
  toggleFavourite,
} = require("../controllers/favouriteController");

router.get("/", getFavourites);
router.post("/toggle", toggleFavourite);

module.exports = router;
