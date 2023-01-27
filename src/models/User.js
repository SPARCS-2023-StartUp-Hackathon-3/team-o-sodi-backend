const mongoose = require("mongoose");

const OSchemaDefinition = {
  Email: {
    type: String,
    default: "",
  },

  Password: {
    type: String,
    default: "",
  },

  UserName: {
    type: String,
    default: "",
  },

  Followers: {
    type: Array,
    default: [],
  },

  Following: {
    type: Array,
    default: [],
  },

  Bio: {
    type: String,
    default: null,
  },

  ProfileImg: {
    type: String,
    default: null,
  },

  Point: {
    type: Number,
    default: 0,
  },
};
const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const UserModel = mongoose.model("User", schema);

module.exports = UserModel;
