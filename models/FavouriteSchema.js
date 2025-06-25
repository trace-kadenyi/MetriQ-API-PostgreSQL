const mongoose = require("mongoose");

const favouritesSchema = new mongoose.Schema(
  {
    // Up to five unique URL strings
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

module.exports = mongoose.model("Favourites", favouritesSchema);
