const mongoose = require("mongoose");

const OSchemaDefinition = {
  StoreId: {
    type: String,
    default: null,
  },

  Brand: {
    type: String,
    default: null,
  },

  Product: {
    type: String,
    default: null,
  },

  Price: {
    type: Number,
    default: 0,
  },

  Images: {
    type: String,
    default: 0,
  },
};

const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const StoreModel = mongoose.model("Store", schema);

module.exports = StoreModel;
