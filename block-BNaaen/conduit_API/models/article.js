const mongoose = require("mongoose");
const slug = require("slug");

const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    tagList: [{ String }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    favorited: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    slug: String,
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("slug")) {
    this.slug = slug(this.title);
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
