const express = require("express");
const userRoutes = require("../../controllers/userControllers/userControllers");
const userRouter = express.Router();
const verifyAuth = require("../../middlewares/verifyAuth");
const isVendor = require("../../middlewares/isVendor");

userRouter.route("/myProfile").get(verifyAuth, userRoutes.myProfile);
userRouter.route("/newOrder/:id").post(verifyAuth, userRoutes.newOrder);
userRouter.route("/myOrders").get(verifyAuth, userRoutes.myOrders);
userRouter
  .route("/requestForVendor")
  .post(verifyAuth, userRoutes.requestForVendor);
userRouter
  .route("/vendorOrders")
  .get(verifyAuth, isVendor, userRoutes.vendorOrders);

module.exports = userRouter;
