var express = require("express");
const user = require("../models/user");
const User = require("../models/user");
var router = express.Router();

router.get("/register", async function (req, res, next) {
  try {
    let user = await User.create(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (err.name == "ValidationError") {
      return res
        .status(400)
        .json({ error: "Password should be minimum of 8 characters long" });
    }
    next(err);
  }
});

router.get("/login", async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email/Password is required" });
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Email not found. Please Register First" });
    }
    let result = await user.verifyPassword(password);
    if (!result) {
      return res
        .status(400)
        .json({ error: "Password doesnt match. Please try again" });
    }
    return res.status(200).json({ success: "You are now logged in" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
