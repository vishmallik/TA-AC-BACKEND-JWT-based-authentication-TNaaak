const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");
const Book = require("../models/book");

router.post("/register", async (req, res, next) => {
  try {
    let user = await User.create(req.body);
    return res.status(201).json({ Success: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Password must be minimum 8 characters long" });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email/Password is required" });
  }
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User not found. Please register" });
  }
  let result = await user.verifyPassword(password);
  if (!result) {
    return res.status(400).json({ error: "Wrong Password" });
  }
  let token = await user.signToken();
  return res.json({ user: user.userJSON(token) });
});

router.use(auth.tokenVerify);

router.put("/cart/:bookId", async (req, res, next) => {
  let bookId = req.params.bookId;
  try {
    let user = User.findByIdAndUpdate(req.user.id, { $push: { cart: bookId } });
    return res.json({ success: "Added to Cart" });
  } catch (error) {
    return next(error);
  }
});

router.delete("/cart/:bookId", async (req, res, next) => {
  let bookId = req.params.bookId;
  try {
    let user = User.findByIdAndUpdate(req.user.id, { $pull: { cart: bookId } });
    return res.json({ success: "Removed from Cart" });
  } catch (error) {
    return next(error);
  }
});
module.exports = router;
