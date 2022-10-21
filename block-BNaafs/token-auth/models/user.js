const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, match: /@/ },
    password: { type: String, minlength: 8 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    try {
      let hashed = await bcrypt.hash(this.password, 10);
      this.password = hashed;
      next();
    } catch (err) {
      next(err);
    }
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (err) {
    err;
  }
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
    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

module.exports = mongoose.model("User", userSchema);
