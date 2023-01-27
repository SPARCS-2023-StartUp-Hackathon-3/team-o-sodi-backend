const express = require("express");
const PostModel = require("../models/Post");
const CommentModel = require("../models/Comment");
const path = require("path");
const fs = require("fs");

const router = express.Router();

function generateToken() {
  const key = "aabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  let i = 0;
  while (i < 12) {
    token += key.charAt(Math.floor(Math.random() * key.length));
    i++;
  }
  return token;
}
console.log("haa");
console.log(generateToken());

class CommentDB {
  static _inst_;
  static getInst = () => {
    if (!CommentDB._inst_) CommentDB._inst_ = new CommentDB();
    return CommentDB._inst_;
  };

  constructor() {
    console.log("[Comment - DB] DB Init Completed");
  }

  GetComments = async ({ postId }) => {
    try {
      const dbRes = await CommentDB.find({ PostId: postId });
      return { data: dbRes };
    } catch (e) {}
  };

  AddComments = async ({ commentId, description, userId }) => {
    try {
      const newItem = new CommentModel({
        CommentId: commentId,
        Description: description,
        UserId: userId,
      });
    } catch (e) {}
  };

  PushLikeComment = async ({ commnetId, userId }) => {
    try {
      const findComment = await CommentModel.findOne({ CommentId: commnetId });
      const likeList = [...findComment.Likes, userId];
      const res = await CommentModel.updateOne(
        { CommentId: commentId },
        { Likes: likeList }
      );
    } catch (e) {
      console.log(`[Comment - DB] Error in Push Like Comment: ${e}`);
    }
  };
}

const CommentDBInst = CommentDB.getInst();

router.get("/getComments", async (req, res) => {
  try {
    const { data } = await CommentDBInst.GetComments({
      postId: req.query.postId,
    });
    return res.status(0).json(data);
  } catch (e) {}
});

router.post("/postComments", async (req, res) => {
  try {
    const commentId = generateToken();
    const description = req.body.description;
    const userId = req.body.userId;

    const dbRes = await AddComments({
      commnetId: commentId,
      description: description,
      userId: userId,
    });
    return true;
  } catch (e) {
    return false;
  }
});

module.exports = router;
