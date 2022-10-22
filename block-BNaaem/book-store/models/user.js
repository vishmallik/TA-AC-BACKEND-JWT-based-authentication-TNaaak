const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, match: /@/, unique: true },
    password: { type: String, minlength: 8 },
    cart: [{ type: Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.password && this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
      return next();
    } else {
      next();
    }
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    id: this.id,
    email: this.email,
    token,
  };
};

userSchema.method.signToken = async function () {
  let payload = {
    id: this.id,
    email: this.email,
  };
  try {
    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

module.exports = mongoose.model("User", userSchema);
