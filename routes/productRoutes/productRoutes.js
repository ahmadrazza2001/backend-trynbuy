const express = require("express");
const productRoutes = require("../../controllers/productControllers/productController");
const productRouter = express.Router();
const verifyAuth = require("../../middlewares/verifyAuth");
const isVendor = require("../../middlewares/isVendor");

productRouter
  .route("/createProduct")
  .post(verifyAuth, productRoutes.createProduct);

productRouter
  .route("/updateProduct/:id")
  .patch(verifyAuth, isVendor, productRoutes.updateProduct);

productRouter
  .route("/deleteProduct/:id")
  .patch(verifyAuth, isVendor, productRoutes.deleteProduct);

productRouter
  .route("/searchProduct")
  .get(verifyAuth, productRoutes.searchProduct);

productRouter
  .route("/myPublicProducts")
  .get(verifyAuth, productRoutes.myPublicProducts);

productRouter
  .route("/myPrivateProducts")
  .get(verifyAuth, productRoutes.myPrivateProducts);

productRouter
  .route("/privateFromPublic/:id")
  .patch(verifyAuth, productRoutes.privateFromPublic);

productRouter
  .route("/publicFromPrivate/:id")
  .patch(verifyAuth, productRoutes.publicFromPrivate);

productRouter.route("/allProducts").get(productRoutes.allProducts);

module.exports = productRouter;
