const jwt = require("jsonwebtoken");
const httpError = require("../models/http-error");

const authRequired = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Auth failed");
    }

    const decodedToken = jwt.verify(token, "MYSECRETCODE");
    req.user = {
      id: decodedToken.userId
    };
    next();
  } catch (e) {
    return next(new httpError("Authentication failed", 401));
  }
};

module.exports = authRequired;
