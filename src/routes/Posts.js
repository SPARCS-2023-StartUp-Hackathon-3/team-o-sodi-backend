const express = require("express");
const PostModel = require("../models/Post");
const StoreModel = require("../models/Store");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

class PostDB {
  static _inst_;
  static getInst = () => {
    if (!PostDB._inst_) PostDB._inst_ = new PostDB();
    return PostDB._inst_;
  };

  constructor() {
    console.log("[Post - DB] DB Init Completed");
  }

  GetPosts = async () => {
    try {
      const res = await PostModel.find();
      let ultimatePost = [];
      for (const a in res) {
        let stores = [];
        for (const b in a.WearTag) {
          const clothInfo = await StoreModel.findOne({ StoreId: b }).catch(
            function (error) {
              console.log("WHY ARE");
            }
          );
          stores = [...stores, clothInfo];
        }
        ultimatePost = [...ultimatePost, stores]; //각각의 element는 { [ { StoreId, Brand, Product, ... },  ], [], [], ... }
      }
      return ultimatePost;
    } catch (e) {
      return null;
    }
  };

  GetRealPosts = async () => {
    try {
      const res = PostModel.find();
      return res;
    } catch (e) {}
  };

  AddPost = async ({
    postId,
    title,
    description,
    userName,
    wearTag,
    images,
    date,
  }) => {
    try {
      const newItem = new PostModel({
        PostId: postId,
        Title: title,
        Description: description,
        UserName: userName,
        WearTag: wearTag,
        Images: images,
        Date: date,
      });
      console.log(newItem);
      const res = await newItem.save();
      console.log(res);
    } catch (e) {
      console.log(`[POST - DB] Post Insert Error: ${e}`);
    }
  };

  PushLikePost = async ({ postId, userName }) => {
    try {
      const findPost = await PostModel.findOne({ PostId: postId });
      const likeList = [...findPost.Likes, userName];
      const res = await PostModel.updateOne(
        { PostId: postId },
        { Likes: likeList }
      );
    } catch (e) {
      console.log(`[Post - DB] Error in Push Like Post: ${e}`);
    }
  };

  MyLikes = async ({ userName }) => {
    try {
      const findPost = await PostModel.find({ Likes: userName });
      return findPost;
    } catch (e) {}
  };

  GetPostDump = async () => {
    try {
      const postdump = await PostModel.find();
      let finale = [];
      console.log(postdump);
      for (const a of postdump) {
        console.log(a);
        const wearTags = a.WearTag;
        let wearTagsBreak = [];
        for (const b of wearTags) {
          const c = await StoreModel.findOne({ StoreId: b });
          wearTagsBreak = [...wearTagsBreak, c];
        }
        finale = [...finale, { post: a, wearTags: wearTagsBreak }];
      }
      return finale;
    } catch (e) {}
  };

  DeletePost = async ({ postId }) => {
    try {
      const dbres = await PostModel.deleteOne({ PostId: postId });
      return true;
    } catch (e) {}
  };

  Test = () => {
    return "Returned from Inst";
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

function currentTime() {
  const today = new Date();
  const timeString =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate() +
    "-" +
    today.getHours() +
    ":" +
    today.getMinutes() +
    ":" +
    today.getSeconds();
  return timeString;
}

router.post("/deletePost", async (req, res) => {
  try {
    const postId = req.body.postId;
    const dbRes = DeletePost({ postId: postId });
    res.status(200).end();
  } catch (e) {
    res.status(200).end();
  }
});

router.post("/postPost", multi_upload.array("img"), async (req, res) => {
  try {
    const token = generateToken();
    const userName = req.body.userName;
    const title = req.body.title;
    const description = req.body.description;
    const wearTag = req.body.wearTag;
    console.log(req.files);
    const image = req.files.map((a) => a.filename);
    const date = currentTime();
    const dbRes = await PostDBInst.AddPost({
      postId: token,
      title: title,
      userName: userName,
      description: description,
      wearTag: wearTag,
      images: image,
      date: date,
    });
    res.status(200).end();
    return true;
  } catch (e) {
    console.log(`[Post - DB] Post Post Error: ${e}`);
    res.status(200).end();
    return false;
  }
});

router.get("/getPostDump", async (req, res) => {
  try {
    const data = await PostDBInst.GetPostDump().catch((e) => {
      console.log(e);
    });
    return res.status(200).json(data); // ??
  } catch (e) {
    console.log(e);
    return res
      .status(200)
      .json([])
      .catch((e) => {
        console.log(e);
      }); // ??
  }
});

router.get("/getPost", async (req, res) => {
  try {
    const data = await PostDBInst.GetRealPosts().catch((e) => {
      console.log(e);
    });
    return res.status(200).json(data); // ??
  } catch (e) {
    console.log(e);
    return res
      .status(200)
      .json([])
      .catch((e) => {
        console.log(e);
      }); // ??
  }
});

router.get("/getPostWear", async (req, res) => {
  try {
    const data = await PostDBInst.GetPosts().catch((e) => {
      console.log(e);
    });
    return res.status(200).json(data); // ??
  } catch (e) {
    console.log(e);
    return res
      .status(200)
      .json([])
      .catch((e) => {
        console.log(e);
      }); // ??
  }
});

router.post("/pushLikePost", async (req, res) => {
  try {
    const userId = req.body.userId;
    const postId = req.body.postId;

    const dbRes = PostDBInst.PushLikePost({ postId: postId, userId: userId });
    res.status(200).end();
  } catch (e) {}
});

router.get("/myLikes", async (req, res) => {
  try {
    const myLikes = await PostDBInst.MyLikes({ userName: req.query.userName });
    return res.status(200).json(myLikes);
  } catch (e) {}
});

router.get("/testPost", async (req, res) => {
  const name = req.query.name;
  //const test = await PostDBInst.Test();
  res.send(`Post Test Worked ${name} ${PostDBInst.Test()}`);
});

// const a = PostDBInst.AddPost({
//   postId: "post1",
//   title: "Sleep",
//   description: "isnecessary",
//   userName: "Hajun",
//   wearTag: [],
//   images: "hell.png",
//   date: "2022-22-22-11:11:11",
// });

module.exports = router;
