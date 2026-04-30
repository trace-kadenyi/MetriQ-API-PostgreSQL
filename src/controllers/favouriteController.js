// controllers/favouritesController.js
const Favourites = require("../models/FavouriteSchema");
const { getUserId } = require("../utils/getUserId"); // ✅ import helper

/** Helper – returns { owner: … } *or* { anonId: … } */
const extractIdent = (req) => {
  const id = getUserId(req); // Mongo _id OR anonId OR null

  // logged‑in path: only if id is truthy
  if (req.user && req.isAuthenticated() && id) {
    return { owner: id };
  }

  // anonymous path: only if id is truthy
  if (id) {
    return { anonId: id };
  }

  // neither header nor session → throw, so code never inserts owner:null
  return null;
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

/** GET /api/favourites */
const getFavourites = async (req, res) => {
  try {
    const ident = extractIdent(req); // ✅ uses new helper
    const list = await getList(ident);
    res.status(200).json({ success: true, favourites: list.favourites });
  } catch (err) {
    console.error("Failed to fetch favourites:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving favourites" });
  }
};

/** POST /api/favourites/toggle */
const toggleFavourite = async (req, res) => {
  try {
    const ident = extractIdent(req); // ✅ uses new helper
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid URL." });
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
    res.status(200).json({ success: true, favourites: list.favourites });
  } catch (err) {
    console.error("Failed to toggle favourite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Error toggling favourite" });
  }
};

/** POST /api/favourites/claim  – merge anon list into user account */
const claimFavourites = async (req, res) => {
  if (!req.user || !req.isAuthenticated()) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  const { anonId } = req.body;
  if (!anonId) {
    return res.status(400).json({ success: false, message: "anonId missing" });
  }

  try {
    const anonDoc = await Favourites.findOne({ anonId });
    if (!anonDoc) {
      return res.status(200).json({ success: true }); // nothing to merge
    }

    const userId = req.user._id;
    const userDoc = await Favourites.findOne({ owner: userId });

    if (userDoc) {
      // merge & dedupe, respect 5‑item limit
      userDoc.favourites = Array.from(
        new Set([...userDoc.favourites, ...anonDoc.favourites])
      ).slice(0, 5);
      await userDoc.save();
      await anonDoc.deleteOne();
    } else {
      // Safety: prevent assigning owner if already exists
      const existing = await Favourites.findOne({ owner: userId });
      if (existing) {
        await anonDoc.deleteOne(); // or optionally merge
      } else {
        anonDoc.owner = userId;
        anonDoc.anonId = null;
        await anonDoc.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to claim favourites:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Error claiming favourites" });
  }
};

module.exports = { getFavourites, toggleFavourite, claimFavourites };
