// controllers/favourite.controller.js
const Favourites = require("../models/FavouriteSchema");

/** Helper – fetch the singleton doc, create if missing */
const getList = async () => {
  let doc = await Favourites.findOne();
  if (!doc) doc = await Favourites.create({ favourites: [] });
  return doc;
};

/** GET /api/favourites → return current array */
const getFavourites = async (req, res) => {
  try {
    const list = await getList();
    return res.status(200).json({ success: true, favourites: list.favourites });
  } catch (err) {
    console.error("Failed to fetch favourites:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving favourites",
      error: err.message,
    });
  }
};

/** POST /api/favourites/toggle → add / remove a URL (max 5) */
const toggleFavourite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid url." });
    }

    const list = await getList();
    const alreadySaved = list.favourites.includes(url);

    if (alreadySaved) {
      list.favourites.pull(url); // 💔 remove
    } else {
      if (list.favourites.length >= 5) {
        return res.status(400).json({
          success: false,
          message: "You can only save up to 5 favourites.",
        });
      }
      list.favourites.addToSet(url); // 💚 add (no dups)
    }

    await list.save();
    return res.status(200).json({ success: true, favourites: list.favourites });
  } catch (err) {
    console.error("Failed to toggle favourite:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error toggling favourite",
      error: err.message,
    });
  }
};

module.exports = { getFavourites, toggleFavourite };
