const express = require("express");
const userRoutes = require("../../controllers/userControllers/userControllers");
const userRouter = express.Router();
const verifyAuth = require("../../middlewares/verifyAuth");
const isVendor = require("../../middlewares/isVendor");

userRouter.route("/myProfile").get(verifyAuth, userRoutes.myProfile);
userRouter.route("/newOrder/:id").post(verifyAuth, userRoutes.newOrder);
userRouter.route("/myOrders").get(verifyAuth, userRoutes.myOrders);
userRouter
  .route("/requestVendor")
  .post(verifyAuth, userRoutes.requestForVendor);
userRouter.route("/vendorOrders").get(verifyAuth, userRoutes.vendorOrders);
userRouter
  .route("/completeOrder/:id")
  .post(verifyAuth, userRoutes.completeOrder);

module.exports = userRouter;
