const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const auth = require("./middlewares/auth");

require("dotenv").config();

mongoose.connect("mongodb://127.0.0.1/token-auth", (err) => {
  console.log(err ? err : "DB true");
});

const usersRouter = require("./routes/users");
const dashboardRouter = require("./routes/dashboard");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", usersRouter);
app.use(auth.tokenVerify);
app.use("/api/v1/dashboard", dashboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ err });
});

module.exports = app;
