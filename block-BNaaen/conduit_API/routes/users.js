const express = require("express");
const router = express.Router();
const User = require("../models/user");

//login
router.post("/login", async function (req, res, next) {
  let { email, password } = req.body.user;
  if (!email || !password) {
    return next("Email/Password can be empty");
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return next("User not Found. Please Register first");
    }
    let result = await user.verifyPassword(password);
    if (!result) {
      return next("Wrong Password");
    }
    let token = await user.signToken();
    return res.json({ user: user.userJSON(token) });
  } catch (error) {
    return next(error);
  }
});

//registration
router.post("/", async (req, res, next) => {
  try {
    let user = await User.create(req.body.user);
    return res.json({ user });
  } catch (error) {
    if (error.code == 11000) {
      return next("Email already registered");
    }
    if (error.name == "ValidationError") {
      return next("Password should be more than 8 characters long");
    }
    return next(error);
  }
});

module.exports = router;
