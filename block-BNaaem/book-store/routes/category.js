const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const auth = require("../middlewares/auth");

//list all cotaegories
router.get("/", (req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return res.status(500).json(err);
    return res.json({ categories });
  });
});

router.use(auth.tokenVerify);
//create a category
router.post("/", (req, res, next) => {
  req.body.userId = req.user.id;
  Category.create(req.body, (err, category) => {
    if (err) return res.status(500).json(err);
    return res.json({ category });
  });
});

//edit a category only if the category belongs to logged in user
router.put("/:categoryId", async (req, res, next) => {
  let categoryId = req.params.categoryId;
  try {
    let category = await Category.findById(categoryId);
    if (req.user.id == category.userId) {
      let updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        req.body
      );
      return res.json({ updatedCategory });
    } else {
      return res.status(403).json({
        error: "You dont have sufficient priviledge to perform this task",
      });
    }
  } catch (error) {
    return next(error);
  }
});

//delete a category only if the category belongs to logged in user
router.delete("/:categoryId", async (req, res, next) => {
  let categoryId = req.params.categoryId;
  try {
    let category = await Category.findById(categoryId);
    if (req.user.id == category.userId) {
      let deletedCategory = await Category.findByIdAndRemove(categoryId);
      return res.json({ deletedCategory });
    } else {
      return res.status(403).json({
        error: "You dont have sufficient priviledge to perform this task",
      });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
