const schema = require("../mongoose.js");
const mongoose = require("mongoose");
const ErrorHandler = require("../../config/ErrorHandler");
const { hash } = require("bcrypt");
modal = {
  username: {
    type: String,
    required: true,
    unique: [true, "Username must be unique"],
  },
  firstName: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "First Name must be atleast 2 characters"],
  },
  lastName: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "Last Name must be atleast 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field"],
    unique: [true, "Email must be unique"],
  },
  password: {
    type: String,
    required: [true, "Password is a required field"],
  },
  role: {
    type: String,
    enum: ["user", "vendor", "admin"],
    default: "user",
  },
  accountStatus: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  },
  requestForVendor: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
  publicProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  privateProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  myOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  profilePic: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};
const User = schema.schemaMake(modal);
User.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.isModified("password")) return next();
    try {
      this.password = await hash(this.password, 12);
      next();
    } catch (error) {
      return next(new ErrorHandler("Error occurred hashing the password", 400));
    }
  } else {
    if (!this.isModified("password")) return next();
    try {
      const hashedPassword = await hash(this.password, 12);
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(
        new ErrorHandler("Error occurred while  hashing the password", 400)
      );
    }
  }
});
module.exports = schema.modelMake("User", User);
