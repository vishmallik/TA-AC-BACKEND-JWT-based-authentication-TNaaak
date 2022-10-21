var express = require("express");
var router = express.Router();
const auth = require("../middlewares/auth");

/* GET home page. */
router.get("/", auth.verifyToken, function (req, res, next) {
  res.json({ msg: "Welcome" });
});

module.exports = router;
