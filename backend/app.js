const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

const app = express();

// Checking if the folder exists, if not, create it
const dir = path.join(__dirname, "images");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "mean-course",
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Connected to MongoDB");
    },
    (error) => {
      console.log("Failed to connect to MongoDB");
      console.log(error);
    }
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") {
  // For local development
  app.use("/images", express.static(path.join("backend/images")));
} else {
  // For production
  app.use("/images", express.static(path.join("images")));
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
