const mongoose = require("mongoose");
const { schemaMake, modelMake } = require("../mongoose.js");

const orderSchemaDefinition = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: Number,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  orderStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  orderProductTitle: {
    type: String,
    required: true,
  },
  orderProductDescription: {
    type: String,
    required: true,
  },
  orderProductPrice: {
    type: Number,
    required: true,
  },
  orderProductQuantity: {
    type: Number,
    default: 1,
  },
  paymentType: {
    type: String,
    enum: ["COD", "Card"],
    default: "COD",
  },
  shippingDetails: {
    orderedBy: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const orderSchema = schemaMake(orderSchemaDefinition);
module.exports = modelMake("Order", orderSchema);
