const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");

router.use(auth.verifyToken);

//get current user
router.get("/", async (req, res, next) => {
  return res.json({ user: req.user });
});

//update user
router.put("/", async (req, res, next) => {
  try {
    let user = await User.findOneAndUpdate(
      { username: req.user.username },
      req.body.user
    );
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
