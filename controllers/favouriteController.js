const Favourites = require("../models/FavouriteSchema");

/** Helper – returns { owner: … } *or* { anonId: … }  */
const extractIdent = (req) => {
  if (req.userId) return { owner: req.userId }; // logged‑in
  const anonId = req.header("x-anon-id");
  if (anonId) return { anonId }; // anonymous
  return null; // neither => error
};

/** Helper – find or create per-user favourites doc */
const getList = async (ident) => {
  if (!ident) throw new Error("Missing user identifier");

  let doc = await Favourites.findOne(ident);
  if (!doc) {
    doc = await Favourites.create({ ...ident, favourites: [] });
  }
  return doc;
};

/** GET /api/favourites → return current favourites for this user */
const getFavourites = async (req, res) => {
  try {
    const ident = extractIdent(req);
    const list = await getList(ident);
    return res.status(200).json({
      success: true,
      favourites: list.favourites,
    });
  } catch (err) {
    console.error("Failed to fetch favourites:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error retrieving favourites",
    });
  }
};

/** POST /api/favourites/toggle → add or remove a URL */
const toggleFavourite = async (req, res) => {
  try {
    const ident = extractIdent(req);
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid URL.",
      });
    }

    const list = await getList(ident);
    const alreadySaved = list.favourites.includes(url);

    if (alreadySaved) {
      list.favourites.pull(url);
    } else {
      if (list.favourites.length >= 5) {
        return res.status(400).json({
          success: false,
          message: "You can only save up to 5 favourites.",
        });
      }
      list.favourites.addToSet(url);
    }

    await list.save();
    return res.status(200).json({
      success: true,
      favourites: list.favourites, // ✅ This is what your frontend expects
    });
  } catch (err) {
    console.error("Failed to toggle favourite:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error toggling favourite",
    });
  }
};

module.exports = {
  getFavourites,
  toggleFavourite,
};
