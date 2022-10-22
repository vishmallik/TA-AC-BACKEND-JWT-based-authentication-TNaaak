const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, match: /@/, unique: true },
    password: { type: String, minlength: 8 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      return next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = async function (password) {
  let result = await bcrypt.compare(password, this.password);
  return result;
};

userSchema.methods.userJSON = function (token) {
  return {
    name: this.name,
    email: this.email,
    token,
  };
};

userSchema.methods.signToken = async function () {
  let payload = {
    name: this.name,
    email: this.email,
  };
  try {
    let token = jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};
module.exports = mongoose.model("User", userSchema);
