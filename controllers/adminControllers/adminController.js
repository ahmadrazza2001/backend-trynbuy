const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncError = require("../../config/catchAsyncErrors");
const Product = require("../../models/productModel/productModel");
const User = require("../../models/userModel/userModel");
// const mongoose = require("mongoose");

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    let user = await User.findOne({
      _id: id,
      accountStatus: { $ne: "deleted" },
    });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    let deleted = await User.findByIdAndUpdate(id, {
      accountStatus: "deleted",
    });
    console.log(deleted);
    if (!deleted) {
      return next(new ErrorHandler("Error deleting this user", 400));
    }
    return res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

exports.getVendorRequests = catchAsyncError(async (req, res, next) => {
  const usersRequestingVendor = await User.find({ requestForVendor: true });
  if (!usersRequestingVendor.length) {
    return next(new ErrorHandler("No vendor requests found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Vendor requests fetched successfully",
    data: {
      users: usersRequestingVendor,
    },
  });
});

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!user.requestForVendor) {
    return next(
      new ErrorHandler("User has not requested to become a vendor", 400)
    );
  }

  user.role = "vendor";
  user.requestForVendor = false;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User updated to Vendor successfully",
    data: {
      user,
    },
  });
});

exports.adminProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const admin = await User.findById(userId);

  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: {
        username: admin.username,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        profilePic: admin.profilePic,
      },
    },
  });
});
