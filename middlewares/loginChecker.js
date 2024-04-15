const ErrorHandler = require("../config/ErrorHandler");
exports.checkIfLoggedIn = (req, res, next) => {
  if (req.cookies["tryAndBuy"]) {
    return next(new ErrorHandler("You're already logged in", 400));
  }
  next();
};
