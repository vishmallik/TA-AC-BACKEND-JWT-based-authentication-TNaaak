const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const auth = require("../middlewares/auth");
const User = require("../models/user");
const Comment = require("../models/comment");
const comment = require("../models/comment");

//list articles
router.get("/", auth.verifyToken, async (req, res, next) => {
  try {
    if (Object.keys(req.query).length != 0) {
      if (req.query.tag) {
        let articles = await Article.find({ tagList: req.query.tag }).sort({
          createdAt: -1,
        });
        return res.json({ articles });
      }
      if (req.query.author) {
        let author = await User.find({ username: req.query.author });
        let articles = await Article.find({ author: author.id }).sort({
          createdAt: -1,
        });
        return res.json({ articles });
      }
      if (req.query.favorited) {
        let user = await User.find({ username: req.query.favorited });
        let articles = await Article.find({
          favorited: user.id,
        }).sort({ createdAt: -1 });
        return res.json({ articles });
      }
      if (req.query.limit) {
        let articles = await Article.find({})
          .limit(req.query.limit)
          .sort({ createdAt: -1 });
        return res.json({ articles });
      }
      if (req.query.offset) {
        let articles = await Article.find({})
          .skip(req.query.skip)
          .sort({ createdAt: -1 });
        return res.json({ articles });
      }
    } else {
      let articles = await Article.find({}).sort({ createdAt: -1 });
      return res.json({ articles });
    }
  } catch (error) {
    return next(error);
  }
});

//feed articles
router.get("/feed", auth.verifyToken, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.user.username }).populate(
      "following"
    );
    let articles = [];
    user.following.forEach(async (followedUser) => {
      articles.push(await Article.find({ author: followedUser.id }));
    });
    if (Object.keys(req.query).length != 0) {
      if (req.query.limit) {
        return res
          .json({ articles: articles.flat(1) })
          .limit(req.query.limit)
          .sort({ createdAt: -1 });
      }
      if (req.query.offset) {
        return res
          .json({ articles: articles.flat(1) })
          .skip(req.query.offset)
          .sort({ createdAt: -1 });
      }
      return res.json({ articles: articles.flat(1) }).sort({ createdAt: -1 });
    }
  } catch (error) {
    return next(error);
  }
});

//create an article
router.post("/", auth.verifyToken, async (req, res, next) => {
  try {
    let article = await Article.create(req.body.article);
    return res.json({ article });
  } catch (error) {
    return next(error);
  }
});

//update article
router.get("/:slug", async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let updatedArticle = await Article.findOneAndUpdate(
      { slug },
      req.body.article,
      {
        new: true,
      }
    );
    return res.json({ updatedArticle });
  } catch (error) {
    return next(error);
  }
});

//delete article
router.delete("/:slug", auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let deletedArticle = await Article.findOneAndDelete({ slug });
    return res.status(200);
  } catch (error) {
    return next(error);
  }
});

//get article
router.get("/:slug", async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    return res.json({ article });
  } catch (error) {
    return next(error);
  }
});

//Add Comments to an Article
router.post("/:slug/comments", auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let comment = await Comment.create(req.body.comment);
    let article = await Article.findOneAndUpdate(
      { slug },
      { $push: { comments: comment.id } }
    );
    return res.json({ comment });
  } catch (error) {
    return next(error);
  }
});

//Get Comments from an Article
router.get("/:slug/comments", async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug }).populate("comments");
    let comments = await Comment.find({ articleId: article.id });
    return res.json({ comments });
  } catch (error) {
    return next(error);
  }
});

//delete comment
router.delete(
  "/:slug/comments/:id",
  auth.verifyToken,
  async (req, res, next) => {
    let slug = req.params.slug;
    let id = req.params.id;
    try {
      let comment = await Comment.findByIdAndDelete(id);
      let article = await Article.findOneAndUpdate(
        { slug },
        { $pull: { comments: comment.id } }
      );
      return res.status(200);
    } catch (error) {
      return next(error);
    }
  }
);

//favourite an article
router.post("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    let user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $push: { favoriteArticle: article.id } }
    );
    let updatedArticle = await Article.findByIdAndUpdate(article.id, {
      $push: { favorited: user.id },
    });
    return res.json({ updatedArticle });
  } catch (error) {
    return next(error);
  }
});

//unfavourite an article
router.delete("/:slug/favorite", auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  try {
    let article = await Article.findOne({ slug });
    let user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $pull: { favoriteArticle: article.id } }
    );
    let updatedArticle = await Article.findByIdAndUpdate(article.id, {
      $pull: { favorited: user.id },
    });
    return res.json({ updatedArticle });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
