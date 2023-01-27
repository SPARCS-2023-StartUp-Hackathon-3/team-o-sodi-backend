const mongoose = require("mongoose");

const OSchemaDefinition = {
  CommentId: {
    type: String,
    default: null,
  },
  Description: {
    type: String,
    default: null,
  },

  UserId: {
    type: String,
    default: null,
  },

  Comments: {
    type: Array,
    default: [],
  },

  Likes: {
    type: Array,
    default: [],
  },
};

const OSchemaOptions = { timestamp: true };

const schema = new mongoose.Schema(OSchemaDefinition, OSchemaOptions);

const CommentModel = mongoose.model("Comment", schema);

module.exports = CommentModel;
