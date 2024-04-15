const mongoose = require("mongoose");
require("dotenv").config();
const connectMongo = async () => {
  const connection = await mongoose.connect(`${process.env.MONGO_URI_STRING}`);
  if (connection) {
    console.log("Database connected");
  } else console.log("err");
};
module.exports = connectMongo;
