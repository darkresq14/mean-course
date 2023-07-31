const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

exports.createUser = (req, res, next) => {
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
      .catch(() => {
        res
          .status(500)
          .json({ message: "Invalid authentication credentials", error });
      });
  });
};

exports.userLogin = async (req, res, next) => {
  let authFailed = false;
  let token = null;
  let fetchedUser = null;
  let error = {};

  try {
    fetchedUser = await User.findOne({ email: req.body.email });

    if (fetchedUser) {
      const result = await bcrypt.compare(
        req.body.password,
        fetchedUser.password
      );

      if (result) {
        token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id },
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
    res
      .status(401)
      .json({ message: "Invalid authentication credentials!", error });
  } else {
    res.status(200).json({ token, expiresIn: 3600, userId: fetchedUser._id });
  }
};
