require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const path = require("path");

const port = process.env.PORT || 4000;

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

// connect to MongoDB
mongoose.connect(process.env.DATABASE_URI);

// middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// cors
app.use(
  cors({
    origin: "http://localhost:5173", // 👉  your React dev origin
    credentials: true, // 👉  allow cookies / Authorization header
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
      sameSite: "lax", // so GitHub → frontend redirect works     secure: process.env.NODE_ENV === "production", // true only on HTTPS prod
    },
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URI, // reuse your Mongo connection
      ttl: 24 * 60 * 60, // keep sessions 1 day
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);

// middleware to handle static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", root);
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
