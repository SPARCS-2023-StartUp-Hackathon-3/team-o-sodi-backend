const express = require("express");
const PostModel = require("../models/Post");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

class PostDB {
  static _inst_;
  static getInst = () => {
    if (!PostDB._inst_) PostDB._inst_ = new PostDB();
    return PostDB._inst_l;
  };

  constructor() {
    console.log("[Post - DB] DB Init Completed");
  }

  GetPosts = async () => {
    try {
      const res = await PostModel.find().limit(100);
      return { data: res };
    } catch (e) {}
  };

  AddPost = async ({
    postId,
    title,
    description,
    userName,
    wearTag,
    images,
  }) => {
    try {
      const newItem = new PostModel({
        PostId: postId,
        Title: title,
        Description: description,
        UserName: userName,
        WearTag: wearTag,
        Images: images,
      });
      const res = await newItem.save();
    } catch (e) {
      console.log(`[POST - DB] Post Insert Error: ${e}`);
    }
  };
}

const PostDBInst = PostDB.getInst();

//Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "postFiles/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const multi_upload = multer({ storage: storage });
//

function generateToken() {
  const key = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  let i = 0;
  while (i < 12) {
    token += key.charAt(Math.floor(Math.random() * key.length));
    i++;
  }
  return token;
}

router.post("/postPost", multi_upload.array("img"), async (req, res) => {
  try {
    const token = generateToken();
    const userName = req.body.userName;
    const title = req.body.title;
    const description = req.body.description;
    const wearTag = req.body.wearTag;
    const image = req.files.map((a) => a.filename);
    const dbRes = await PostDBInst.AddPost({
      postId: token,
      title: title,
      userName: userName,
      description: description,
      wearTag: wearTag,
      images: image,
    });
    return true;
  } catch (e) {
    console.log(`[Post - DB] Post Post Error: ${e}`);
    return false;
  }
});

router.get("/getPost", async (req, res) => {
  try {
    const { data } = await PostDBInst.GetPosts();
    if (dbRes) return res.status(0).json(data);
    else return res.status(2).json(false); // ??
  } catch (e) {
    return res.status(1).json(false); // ??
  }
});

module.exports = router;
