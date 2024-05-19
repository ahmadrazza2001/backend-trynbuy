const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncError = require("../../config/catchAsyncErrors");
const Product = require("../../models/productModel/productModel");
const User = require("../../models/userModel/userModel");
const mongoose = require("mongoose");

//create product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  const { title, description, price, keywords, images, arImage, productType } =
    req.body;
  try {
    const newProduct = new Product({
      userId: req.userData.user.id,
      title,
      description,
      price,
      keywords,
      images,
      arImage,
      productType,
    });
    const saved = await newProduct.save();

    if (!saved) {
      return next(new ErrorHandler("Trouble creating a new product", 400));
    }
    const userUpdateField =
      saved.status === "privateProducts" ? "privateProducts" : "publicProducts";

    await User.findByIdAndUpdate(req.userData.user.id, {
      $push: { [userUpdateField]: saved._id },
    });

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
    });
  } catch (error) {
    console.error(error);
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//edit product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const id = req.params.id;
  const {
    title,
    description,
    price,
    keywords,
    images,
    arImage,
    productType,
    productStatus,
  } = req.body;
  try {
    let product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (userId.toString() !== product.userId.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this product", 400)
      );
    }
    product.title = title;
    product.description = description;
    product.price = price;
    product.keywords = keywords;
    product.images = images;
    product.arImage = arImage;
    product.productType = productType;
    product.productStatus = productStatus;
    let saved = await product.save();
    if (!saved) {
      return next(new ErrorHandler("Error updating the product", 400));
    }
    return res
      .status(200)
      .json({ status: "success", message: "Product updated successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//delete product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  // const userId = req.userData.user.id;

  try {
    const product = await Product.findOne({
      _id: id,
    });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const deleted = await Product.deleteOne({ _id: id });

    if (deleted.deletedCount === 0) {
      return next(new ErrorHandler("Error deleting the product", 400));
    }
    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//search product
exports.searchProduct = catchAsyncError(async (req, res, next) => {
  const productType = req.query.productType;
  try {
    let products = await Product.find({
      productType: productType,
      productStatus: "public",
    }).populate("userId", ["username", "firstName", "lastName"]);

    if (products.length === 0) {
      return next(new ErrorHandler("Products not found!", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Products found!",
      body: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//my public products
exports.myPublicProducts = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  try {
    const user = await User.findById(userId).select("publicProducts");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const publicProductIds = user.publicProducts;
    const products = await Product.find({
      _id: { $in: publicProductIds },
      productStatus: "public",
    }).populate("userId", "firstName lastName username createdAt");

    if (!products || products.length === 0) {
      return next(new ErrorHandler("No public products found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "My Public Products Found!",
      body: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//my private products
exports.myPrivateProducts = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  try {
    const user = await User.findById(userId).select("privateProducts");

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const privateProductIds = user.publicProducts;
    const products = await Product.find({
      _id: { $in: privateProductIds },
      productStatus: "private",
    }).populate("userId", "firstName lastName username createdAt");

    if (!products || products.length === 0) {
      return next(new ErrorHandler("No private products found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "My Private Products Found!",
      body: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});

//private to public
exports.privateFromPublic = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.userData.user.id;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(userId);
    if (!user || !user.publicProducts.includes(productId)) {
      return res.status(404).json({
        status: "failed",
        message: "No such product found in user's public products",
      });
    }
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { publicProducts: productId },
        $push: { privateProducts: productId },
      },
      { session }
    );
    await Product.findByIdAndUpdate(
      productId,
      { productStatus: "private" },
      { session }
    );
    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "Product successfully moved from public to private",
    });
  } catch (error) {
    await session.abortTransaction();
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  } finally {
    await session.endSession();
  }
});

//public to private
exports.publicFromPrivate = catchAsyncError(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.userData.user.id;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(userId);
    if (!user || !user.privateProducts.includes(productId)) {
      return res.status(404).json({
        status: "failed",
        message: "No such product found in user's private products",
      });
    }
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { privateProducts: productId },
        $push: { publicProducts: productId },
      },
      { session }
    );
    await Product.findByIdAndUpdate(
      productId,
      { productStatus: "public" },
      { session }
    );
    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "Product successfully moved from private to public",
    });
  } catch (error) {
    await session.abortTransaction();
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  } finally {
    await session.endSession();
  }
});

exports.allProducts = catchAsyncError(async (req, res, next) => {
  try {
    const products = await Product.find();

    console.log(products);

    if (!products.length) {
      return next(new ErrorHandler("No products found", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Products Found!",
      body: products,
    });
  } catch (error) {
    console.error("Error in fetching products:", error);
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
