const jwt = require("jsonwebtoken");
const ErrorHandler = require("../config/ErrorHandler");

const verifyAuth = (req, res, next) => {
  try {
    const authToken = req.headers.authorization.split(" ")[1];
    if (!authToken) {
      return next(
        new ErrorHandler("You are Unauthorized - No token provided.", 401)
      );
    }

    const data = jwt.verify(authToken, process.env.JWT_SECRET);
    req.userData = { user: { id: data.id, role: data.role } };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new ErrorHandler("JWT has expired. Please log in again.", 401)
      );
    }
    return next(new ErrorHandler("Invalid JWT token.", 403));
  }
};

module.exports = verifyAuth;
