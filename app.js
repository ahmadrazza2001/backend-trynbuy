const express = require("express");
const authRouter = require("./routes/authRoutes/authRoutes");
const productRouter = require("./routes/productRoutes/productRoutes");
const adminRouter = require("./routes/adminRoutes/adminRoutes");
const userRouter = require("./routes/userRoutes/userRoutes");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalError = require("./controllers/errorControllers/errorController.js");

const ExpressMongoSanitize = require("express-mongo-sanitize");
const app = express();
require("./database/db")();
app.use(cookieParser());
app.use(ExpressMongoSanitize());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);

app.use(globalError);
module.exports = app;
