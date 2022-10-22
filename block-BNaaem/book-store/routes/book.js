const express = require("express");
const Book = require("../models/book");
const router = express.Router();
const Comment = require("../models/comment");
const auth = require("../middlewares/auth");

//Get all books
router.get("/", (req, res, next) => {
  Book.find({}, (err, bookList) => {
    if (err) return res.status(500).json(err);
    return res.json({ bookList });
  });
});

//view all comments for a specific book
router.get("/:id/comments", (req, res, next) => {
  let id = req.params.id;
  Comment.find({ bookId: id }, (err, comments) => {
    if (err) return res.status(500).json(err);
    return res.json({ comments });
  });
});

//count books for each category
router.get("/category/count", (req, res, next) => {
  Book.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]).exec((err, booksCount) => {
    if (err) return res.status(500).json(err);
    return res.json({ booksCount });
  });
});

//list books by category
router.get("/category/:category", (req, res, next) => {
  let category = req.params.category;
  Book.find({ category }, (err, bookList) => {
    if (err) return res.status(500).json(err);
    return res.json({ bookList });
  });
});

//list book by author
router.get("/author/:authorName", (req, res, next) => {
  let author = req.params.authorName;
  Book.find({ author }, (err, bookList) => {
    if (err) return res.status(500).json(err);
    return res.json({ bookList });
  });
});

//find all tags
router.get("/tags", (req, res, next) => {
  Book.aggregate([
    {
      $unwind: "$tag",
    },
    {
      $group: {
        _id: "$tags",
      },
    },
  ]).exec((err, tags) => {
    if (err) return res.status(500).json(err);
    return res.json({ tags });
  });
});

// list tags in ascending order
router.get("/tags/ascending", (req, res, next) => {
  Book.aggregate([
    {
      $unwind: "$tag",
    },
    {
      $group: {
        _id: "$tags",
      },
    },
    {
      $sort: 1,
    },
  ]).exec((err, tags) => {
    if (err) return res.status(500).json(err);
    return res.json({ tags });
  });
});

// list tags in descending order
router.get("/tags/descending", (req, res, next) => {
  Book.aggregate([
    {
      $unwind: "$tag",
    },
    {
      $group: {
        _id: "$tags",
      },
    },
    {
      $sort: -1,
    },
  ]).exec((err, tags) => {
    if (err) return res.status(500).json(err);
    return res.json({ tags });
  });
});

//count books for each tag
router.get("/tags/count", (req, res, next) => {
  Book.aggregate([
    {
      $unwind: "$tag",
    },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 },
      },
    },
  ]).exec((err, booksCount) => {
    if (err) return res.status(500).json(err);
    return res.json({ booksCount });
  });
});

// filter book by tags
router.get("/tags/:tagName", (req, res, next) => {
  let tagName = req.params.tagName;
  Book.find({ tags: tagName }, (err, bookList) => {
    if (err) return res.status(500).json(err);
    return res.json({ bookList });
  });
});

//get single book
router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  Book.findById(id, (err, book) => {
    if (err) return res.status(500).json(err);
    return res.json({ book });
  });
});

router.use(auth.tokenVerify);

//create a book
router.post("/", (req, res, next) => {
  req.body.userId = req.user.id;
  Book.create(req.body, (err, book) => {
    if (err) return res.status(500).json(err);
    return res.json({ book });
  });
});

//update a book only if the book belongs to logged in user
router.put("/:id", async (req, res, next) => {
  let id = req.params.id;
  try {
    let book = await Book.findById(id);
    if (book.userId == req.user.id) {
      let updatedBook = await Book.findByIdAndUpdate(id, req.body);
      return res.json({ updatedBook });
    } else {
      return res.status(403).json({
        error: "You dont have sufficient priviledge to perform this task",
      });
    }
  } catch (error) {
    return next(error);
  }
});

//delete a book only if the book belongs to logged in user
router.delete("/:id", async (req, res, next) => {
  let id = req.params.id;
  try {
    let book = await Book.findById(id);
    if (book.userId == req.user.id) {
      let deletedBook = await Book.findByIdAndRemove(id);
      return res.json({ deletedBook });
    } else {
      return res.status(403).json({
        error: "You dont have sufficient priviledge to perform this task",
      });
    }
  } catch (error) {
    return next(error);
  }
});

//add comment
router.post("/comments", (req, res, next) => {
  req.body.userId = req.user.id;
  Comment.create(req.body, (err, comment) => {
    if (err) return res.status(500).json(err);
    return res.json({ comment });
  });
});

module.exports = router;
