const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/user");

router.use(auth.verifyToken);

//Get Profile
router.get("/:username", async (req, res, next) => {
  let username = req.params.username;
  try {
    let profile = await User.findOne({ username });
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
});

// Follow user
router.post("/:username/follow", async (req, res, next) => {
  let username = req.params.username;
  try {
    let profile = await User.findOneAndUpdate(
      { username },
      { $push: { followers: req.user.username } }
    );
    let user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $push: { following: profile.username } }
    );
    return res.json({ profile });
  } catch (error) {}
});

// Unfollow user
router.delete("/:username/follow", async (req, res, next) => {
  let username = req.params.username;
  try {
    let profile = await User.findOneAndUpdate(
      { username },
      { $pull: { followers: req.user.username } }
    );
    let user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $pull: { following: profile.username } }
    );
    return res.json({ profile });
  } catch (error) {}
});

module.exports = router;
