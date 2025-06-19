require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const port = process.env.PORT || 4000;

// routes
const root = require("./routes/root");
const urlChecker = require("./routes/urlChecker");
const reportRoutes = require("./routes/reportRoutes");
// connect to MongoDB
mongoose.connect(process.env.DATABASE_URI);

// middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// cors
app.use(cors());

// body-parser
app.use(bodyparser.json());

// middleware to handle json data
app.use(express.json());

// middleware to handle static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", root);
app.use("/api/url", urlChecker);
app.use("/api/url", reportRoutes);

// start server
mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });
});
