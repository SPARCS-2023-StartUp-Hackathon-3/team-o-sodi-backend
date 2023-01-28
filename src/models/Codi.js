const mongoose = require("mongoose");

const OSchemaDefinition = {
  CodiId: {
    type: String,
    default: null,
  },

  Clothes: {
    type: Array,
    default: [],
  },

  Images: {
    type: String,
    default: null,
  },
};

const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const CodiModel = mongoose.model("Codi", schema);

module.exports = CodiModel;
