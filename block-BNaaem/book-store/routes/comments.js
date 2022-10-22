const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const auth = require("../middlewares/auth");

router.use(auth.tokenVerify);
//edit a comment only if the comment belongs to logged in user
router.put("/:commentId", async (req, res, next) => {
  let commentId = req.params.commentId;
  try {
    let comment = await Comment.findbyId(commentId);
    if (comment.userId == req.user.id) {
      let updatedComment = await Comment.findByIdAndUpdate(commentId, req.body);
      return res.json({ updatedComment });
    } else {
      return res.status(403).json({
        error: "You dont have sufficient priviledge to perform this task",
      });
    }
  } catch (error) {
    return next(error);
  }
});

//delete a comment only if the comment belongs to logged in user
router.delete("/:commentId", async (req, res, next) => {
  let commentId = req.params.commentId;
  try {
    let comment = await Comment.findbyId(commentId);
    if (comment.userId == req.user.id) {
      let deletedComment = await Comment.findByIdAndDelete(commentId);
      return res.json({ deletedComment });
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
