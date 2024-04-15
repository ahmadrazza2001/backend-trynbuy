const express = require("express");
const authRoutes = require("../../controllers/authControllers/authController");
const authRouter = express.Router();

authRouter.route("/signup").post(authRoutes.signupController);
authRouter.route("/login").post(authRoutes.loginController);

module.exports = authRouter;
