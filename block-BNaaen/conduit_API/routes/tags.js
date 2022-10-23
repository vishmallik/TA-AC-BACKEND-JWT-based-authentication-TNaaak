const express = require("express");
const router = express.Router();
const Article = require("../models/article");

router.get("/", async (req, res, next) => {
  let tags = [];
  try {
    let articles = await Article.aggregate([
      {
        $unwind: "$tagList",
      },
      {
        $group: {
          _id: "$tagList",
        },
      },
    ]).forEach((elm) => {
      tags.push(elm._id);
    });
    return res.json({ tags });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
