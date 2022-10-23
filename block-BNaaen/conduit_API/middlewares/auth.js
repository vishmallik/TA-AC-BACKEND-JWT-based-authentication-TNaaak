const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: async (req, res, next) => {
    let token = req.headers.authorization;
    try {
      if (token) {
        let payload = await jwt.verify(token, process.env.secret);
        req.user = payload;
        return next();
      } else {
        return next("Token Required");
      }
    } catch (error) {
      return next(error);
    }
  },
};
