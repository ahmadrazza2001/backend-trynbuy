const express = require("express");
const adminRouter = express.Router();
const adminRoutes = require("../../controllers/adminControllers/adminController");
const verifyAuth = require("../../middlewares/verifyAuth");
const isAdmin = require("../../middlewares/isAdmin");

adminRouter
  .route("/deleteUser/:id")
  .patch(verifyAuth, isAdmin, adminRoutes.deleteUser);

adminRouter
  .route("/getVendorRequests")
  .get(verifyAuth, isAdmin, adminRoutes.getVendorRequests);

adminRouter
  .route("/updateUserRole/:id")
  .patch(verifyAuth, isAdmin, adminRoutes.updateUserRole);

adminRouter
  .route("/adminProfile")
  .get(verifyAuth, isAdmin, adminRoutes.adminProfile);

module.exports = adminRouter;
