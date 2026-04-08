// auth/routes.js
const express = require("express");
const passport = require("./passport");

const router = express.Router();

/* ─────── GOOGLE ─────── */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "/");
  }
);

/* ─────── GITHUB ─────── */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login-failed" }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "/");
  }
);

// me
router.get("/me", (req, res) => {
  // req.user is set by passport.session() if the cookie is valid
  res.json({ user: req.user ?? null });
});

/* ─────── LOGOUT ─────── */
router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session = null; // clear cookie-session
    res.sendStatus(200);
  });
});

module.exports = router;
