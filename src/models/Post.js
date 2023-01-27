const mongoose = require("mongoose");

const OSchemaDefinition = {
  PostId: {
    type: String,
    default: null,
  },

  Title: {
    type: String,
    default: null,
  },

  Description: {
    type: String,
    default: null,
  },

  UserName: {
    type: String,
    default: null,
  },

  WearTag: {
    type: Array,
    default: [],
  },

  Comments: {
    type: Array,
    default: [],
  },

  Likes: {
    type: Array,
    default: [],
  },
  Images: {
    type: Array,
    default: [],
  },
};
const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const PostModel = mongoose.model("Post", schema);

module.exports = PostModel;
