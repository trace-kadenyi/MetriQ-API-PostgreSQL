const mongoose = require("mongoose");

// Score schema block
const scoreSchema = new mongoose.Schema(
  {
    performance: { type: Number, required: true, min: 0, max: 100 },
    accessibility: { type: Number, required: true, min: 0, max: 100 },
    seo: { type: Number, required: true, min: 0, max: 100 },
    bestPractices: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

// score block schema for mobile and desktop
const scoreBlockSchema = new mongoose.Schema(
  { mobile: scoreSchema, desktop: scoreSchema },
  { _id: false }
);

// competitor schema block
const competitorSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    label: String,
    scores: { type: scoreBlockSchema, required: true },
  },
  { _id: false }
);

/* ----- main schema ----- */
const comparisonSchema = new mongoose.Schema(
  {
    anonId: { type: String, required: true, index: true },
    userSiteUrl: { type: String, required: true },
    userScores: { type: scoreBlockSchema, required: true },
    competitors: [competitorSchema],
  },
  { timestamps: true }
);

/* auto‑purge after 30 days */
comparisonSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model("Comparison", comparisonSchema);
