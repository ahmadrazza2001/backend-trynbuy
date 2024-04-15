const ErrorHandler = require("../config/ErrorHandler");
const User = require("../models/userModel/userModel");

const isVendor = async (req, res, next) => {
  const id = req.userData.user.id;
  try {
    const user = await User.findById(id);
    if (user.role === "vendor") {
      return next();
    } else {
      return next(new ErrorHandler("You are not a vendor", 403));
    }
  } catch (error) {
    return next(new ErrorHandler("An error occurred", 500));
  }
};

module.exports = isVendor;
