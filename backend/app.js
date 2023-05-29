const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("./models/post");

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

app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });
  post.save().then((result) => {
    res
      .status(201)
      .json({ message: "Post added successfully", postId: result._id });
  });
});

app.put("/api/posts/:id", (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
  });
  Post.findOneAndUpdate({ _id: req.params.id }, post).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Post edited successfully" });
  });
});

app.get("/api/posts", (req, res, next) => {
  Post.find().then((documents) => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: documents,
    });
  });
});

app.get("/api/posts/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json({
        message: `Post with id ${req.params.id} fetched successfully!`,
        post: post,
      });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

app.delete("/api/posts/:id", (req, res, next) => {
  Post.findByIdAndDelete(req.params.id).then((result) => {
    console.log(result);
    res.status(200).json({ message: "Post deleted" });
  });
});

module.exports = app;
