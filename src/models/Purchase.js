const mongoose = require("mongoose");

const OSchemaDefinition = {
  PurchaseId: {
    type: String,
    defualt: null,
  },

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
    type: String,
    default: null,
  },

  UserName: {
    type: String,
    default: null,
  },

  Images: {
    type: Array,
    default: [],
  },

  Date: {
    //yyyy-mm-dd-hh:mm:ss
    type: String,
    default: null,
  },
};

const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const PurchaseModel = mongoose.model("Purchase", schema);

module.exports = PurchaseModel;
