const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          id: result._id,
          title: result.title,
          content: result.content,
          imagePath: result.imagePath,
        },
      });
    })
    .catch(() => {
      res.status(500).json({ message: "Creating a post failed!" });
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = {
    title: req.body.title,
    content: req.body.content,
    imagePath,
    creator: req.userData.userId,
  };
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.matchedCount > 0) {
        res.status(200).json({
          message: "Post edited successfully",
        });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Couldn't update post!" });
    });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        postsCount: count,
      });
    })
    .catch(() => {
      res.status(500).json({ message: "Fetching posts failed!" });
    });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json({
          message: `Post with id ${req.params.id} fetched successfully!`,
          post: post,
        });
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Fetching post failed!" });
    });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Post deleted" });
      } else {
        res.status(401).json({
          message: "Not authorized",
        });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Deleting post failed!" });
    });
};
