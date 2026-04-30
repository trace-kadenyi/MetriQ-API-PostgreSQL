const mongoose = require("mongoose");

// favourites schema
const favouritesSchema = new mongoose.Schema(
  {
    /** Present if the visitor is logged‑in */
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    /** Present if the visitor is anonymous (what you called userId before) */
    anonId: { type: String, default: null },

    favourites: {
      type: [String],
      validate: [
        {
          validator: (arr) => arr.length <= 5,
          message: "You can only save up to 5 favourites.",
        },
        {
          validator: (arr) => new Set(arr).size === arr.length,
          message: "Duplicate URLs are not allowed in favourites.",
        },
      ],
    },
  },
  { timestamps: true }
);

// Make sure each account (or anon id) has **one** doc
favouritesSchema.index({ owner: 1 }, { unique: true, sparse: true });
favouritesSchema.index({ anonId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Favourites", favouritesSchema);
