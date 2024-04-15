const mongoose = require("mongoose");
const { Schema, model } = mongoose;
exports.schemaMake = (modal) => {
  return new Schema(modal);
};
exports.modelMake = (schemaName, schema) => {
  return model(schemaName, schema);
};
