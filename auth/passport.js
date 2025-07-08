const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/UserSchema");

passport.serializeUser((user, done) => done(null, user.id)); // Mongo _id
passport.deserializeUser((id, done) =>
  User.findById(id).then((u) => done(null, u))
);

function upsertUser({ provider, id, profile }) {
  return User.findOneAndUpdate(
    { provider, providerId: id },
    {
      provider,
      providerId: id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      avatar: profile.photos?.[0]?.value,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/* Google */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_access, _refresh, profile, done) => {
      try {
        done(
          null,
          await upsertUser({ provider: "google", id: profile.id, profile })
        );
      } catch (err) {
        done(err);
      }
    }
  )
);

/* GitHub */
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    async (_access, _refresh, profile, done) => {
      try {
        done(
          null,
          await upsertUser({ provider: "github", id: profile.id, profile })
        );
      } catch (err) {
        done(err);
      }
    }
  )
);

module.exports = passport;
