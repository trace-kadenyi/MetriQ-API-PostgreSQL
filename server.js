require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
const cors = require("cors");
const bodyparser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const path = require("path");
// port
const port = process.env.PORT || 4000;

// Add this RIGHT BEFORE your routes in server.js:
app.get("/api/env-check", (req, res) => {
  res.json({
    openRouterKeyExists: !!process.env.OPENROUTER_API_KEY,
    openRouterKeyPreview: process.env.OPENROUTER_API_KEY 
      ? process.env.OPENROUTER_API_KEY.substring(0, 15) + "..."
      : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('OPENROUTER') || key.includes('KEY')
    ),
    timestamp: new Date().toISOString()
  });
});

// routes
const passport = require("./auth/passport");
const authRoutes = require("./auth/routes");
const root = require("./routes/root");
const urlChecker = require("./routes/urlChecker");
const reportRoutes = require("./routes/reportRoutes");
const summarizeRoutes = require("./routes/summarize");
const favouritesRoutes = require("./routes/favouritesRoutes");
const comparisonRoutes = require("./routes/comparisonRoutes");
const competitorAiRoutes = require("./routes/competitorAiAnalysisRoute");
const userRoutes = require("./routes/userRoutes");

// connect to MongoDB
mongoose.connect(process.env.DATABASE_URI);

// middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// body-parser
app.use(bodyparser.json());

// middleware to handle json data
app.use(express.json());

// express-session  (works with Passport)
app.use(
  session({
    name: "oauth-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none", // 🔥 Must be 'none' for cross-site
      secure: true, // 🔥 Required in production
    },
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URI,
      ttl: 24 * 60 * 60,
    }),
  })
);

// passport auth
app.use(passport.initialize());
app.use(passport.session());

// middleware to handle static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", root);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/url", urlChecker);
app.use("/api/url", reportRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/favourites", favouritesRoutes);
app.use("/api/", comparisonRoutes);
app.use("/api/ai/comparison", competitorAiRoutes);

// start server
mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
});
