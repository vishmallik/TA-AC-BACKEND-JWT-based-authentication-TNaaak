var express = require("express");
var router = express.Router();
const User = require("../models/user");

router.post("/register", async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    return res.status(201).json({ success: "User Created" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Password should be minimum 8 characters long" });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email/Password is required" });
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User Email not Found" });
    }
    let result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: "Password mismatch" });
    }
    let token = await user.signToken();
    return res.json({ user: user.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
