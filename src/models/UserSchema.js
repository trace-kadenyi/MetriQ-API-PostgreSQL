const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /** OAuth provider that authenticated the user */
    provider: { type: String, enum: ["google", "github"], required: true },

    /** Stable user id received from the provider (Google sub, GitHub id, …) */
    providerId: {
      type: String,
      required: true,
    } /** Email *if* the provider supplied one (Google always, GitHub if public) */,
    email: {
      type: String,
    } /** Optional public profile info from the provider */,
    name: { type: String },
    avatar: { type: String } /** Your existing per‑user prefs */,
    theme: { type: String, enum: ["light", "dark"], default: "light" },
  },
  { timestamps: true }
);

/* ‑‑ unique on (“google”, googleId) or (“github”, githubId) ‑‑ */
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
