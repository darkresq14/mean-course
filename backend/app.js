const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const postRoutes = require("./routes/post");

const app = express();

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

// Mapping /images to go to /backend/images
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postRoutes);

module.exports = app;
