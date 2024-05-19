const User = require("../../models/userModel/userModel");
const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//signup
exports.signupController = catchAsyncErrors(async (req, res, next) => {
  const session = await mongoose.startSession();
  const { firstName, username, lastName, email, password } = req.body;
  try {
    session.startTransaction();
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new ErrorHandler("Email or Username already exists", 400));
    }
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password,
    });
    await newUser.save();
    return res.status(201).json({
      status: "success",
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        profilePic: newUser.profilePic,
        products: newUser.products,
        // lastPasswordUpdated: newUser.lastPasswordUpdated,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    await session.endSession();
    req.body = null;
  }
});

//login
exports.loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      return next(new ErrorHandler("Invalid email/username or password", 404));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    if (user.accountStatus === "deleted") {
      return next(new ErrorHandler("Account not found!", 404));
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
    };

    const authToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      authToken,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
};
