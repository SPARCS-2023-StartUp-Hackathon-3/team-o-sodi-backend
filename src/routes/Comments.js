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
      const dbRes = await PostModel.find({ PostId: postId });
      const comments = dbRes.Comments;
      return comments;
    } catch (e) {}
  };

  AddComments = async ({ postId, commentId, description, userName }) => {
    try {
      const newItem = new CommentModel({
        CommentId: commentId,
        Description: description,
        UserName: userName,
      });
      const res = await newItem.save();
      const thePost = await PostModel.findOne({ PostId: postId });
      const prevComments = thePost.Comments;
      const resDB = await PostModel.updateOne(
        { PostId: postId },
        {
          Comments: [
            ...prevComments,
            {
              CommentId: commentId,
              Description: description,
              UserName: userName,
            },
          ],
        }
      );
    } catch (e) {}
  };
}

const CommentDBInst = CommentDB.getInst();

router.get("/getComments", async (req, res) => {
  try {
    const data = await CommentDBInst.GetComments({
      postId: req.query.postId,
    });
    //res.send(data);
    return res.status(200).json(data);
  } catch (e) {}
});

router.post("/postComments", async (req, res) => {
  try {
    const commentId = generateToken();
    const description = req.body.description;
    const userName = req.body.userName;
    const postId = req.body.postId;

    const dbRes = await AddComments({
      postId: postId,
      commentId: commentId,
      description: description,
      userName: userName,
    });
    return true;
  } catch (e) {
    return false;
  }
});

// const a = CommentDBInst.AddComments({
//   postId: "post1",
//   commentId: "comment2",
//   description: "Hungyyyyyyyy",
//   userName: "Miru",
// });

module.exports = router;
