const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, match: /@/, unique: true },
    password: { type: String, minlength: 8 },
    bio: String,
    image: String,
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    articles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    favoriteArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  next();
});
userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};
userSchema.methods.signToken = async function () {
  let payload = {
    username: this.username,
    email: this.email,
  };
  try {
    let token = await jwt.sign(payload, process.env.secret);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    email: this.email,
    token,
    username: this.username,
    bio: this.bio,
    image: this.image,
  };
};

module.exports = mongoose.model("User", userSchema);
