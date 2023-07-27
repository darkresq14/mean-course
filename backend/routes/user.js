const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({ message: "User created!", result });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  });
});

router.post("/login", async (req, res, next) => {
  let authFailed = false;
  let token = null;
  let error = {};

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);

      if (result) {
        token = jwt.sign(
          { email: user.email, userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
      } else {
        authFailed = true;
      }
    } else {
      authFailed = true;
    }
  } catch (err) {
    authFailed = true;
    error = err;
  }

  if (authFailed) {
    res.status(401).json({ message: "Auth failed", error });
  } else {
    res.status(200).json({ token, expiresIn: 3600 });
  }
});

module.exports = router;
