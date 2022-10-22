const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    cover: String,
    author: String,
    pages: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
