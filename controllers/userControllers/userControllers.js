const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncError = require("../../config/catchAsyncErrors");
const Product = require("../../models/productModel/productModel");
const User = require("../../models/userModel/userModel");
const Order = require("../../models/orderModel/orderModel");

exports.myProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountStatus: user.accountStatus,
        requestForVendor: user.requestForVendor,
        profilePic: user.profilePic,
      },
    },
  });
});

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const { id: productId } = req.params;
  const userId = req.userData.user.id;
  // console.log(req.headers);
  const { orderedBy, email, address, city, phone } = req.body.shippingDetails;

  if (!orderedBy || !email || !address || !city || !phone) {
    return next(new ErrorHandler("All shipping details must be provided", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const newOrder = new Order({
    userId,
    productId,
    orderProductTitle: product.title,
    orderProductDescription: product.description,
    orderProductPrice: product.price,
    orderProductQuantity: product.quantity,
    shippingDetails: {
      orderedBy,
      email,
      address,
      city,
      phone,
    },
  });

  const savedOrder = await newOrder.save();
  if (!savedOrder) {
    return next(new ErrorHandler("Failed to create order", 500));
  }

  await User.findByIdAndUpdate(userId, {
    $push: { myOrders: savedOrder._id },
  });

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    order: savedOrder,
  });
});

exports.myOrders = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const userWithOrders = await User.findById(userId).populate("myOrders");

  if (!userWithOrders) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!userWithOrders.myOrders.length) {
    return res.status(200).json({
      status: "success",
      message: "No orders found for the user",
    });
  }

  res.status(200).json({
    status: "success",
    count: userWithOrders.myOrders.length,
    orders: userWithOrders.myOrders,
  });
});

exports.requestForVendor = catchAsyncError(async (req, res, next) => {
  const userId = req.userData.user.id;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { requestForVendor: true },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new ErrorHandler("User not found or update failed", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Request sent successfully",
    data: {
      user: updatedUser,
    },
  });
});

exports.vendorOrders = catchAsyncError(async (req, res, next) => {
  const vendorId = req.userData.user.id;
  const products = await Product.find({ userId: vendorId });

  if (!products.length) {
    return res.status(200).json({
      status: "success",
      message: "No products found for this vendor",
    });
  }

  const productIds = products.map((product) => product._id);
  const orders = await Order.find({ productId: { $in: productIds } }).populate(
    "userId",
    "firstName lastName email phone"
  );

  if (!orders.length) {
    return res.status(200).json({
      status: "success",
      message: "No orders found for the vendor's products",
    });
  }

  res.status(200).json({
    status: "success",
    count: orders.length,
    orders: orders.map((order) => ({
      orderId: order._id,
      productTitle: order.orderProductTitle,
      quantity: order.orderProductQuantity,
      orderStatus: order.orderStatus,
      paymentType: order.paymentType,
      customer: {
        id: order.userId._id,
        firstName: order.userId.firstName,
        lastName: order.userId.lastName,
        username: order.userId.username,
        email: order.userId.email,
        phone: order.userId.phone,
      },
      shippingDetails: order.shippingDetails,
    })),
  });
});

exports.completeOrder = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  try {
    let order = await Order.findById(id);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }
    if (order.orderStatus !== "pending") {
      return next(new ErrorHandler("Order is not in a pending state", 400));
    }
    order.orderStatus = "completed";
    let saved = await order.save();

    if (!saved) {
      return next(new ErrorHandler("Error completing the order", 400));
    }

    return res.status(200).json({
      status: "success",
      message: "Order updated successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.statusCode || error.code)
    );
  }
});
