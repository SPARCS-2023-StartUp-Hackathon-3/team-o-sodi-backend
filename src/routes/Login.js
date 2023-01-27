const express = require("express");
const UserModel = require("../models/User");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

class RegDB {
  static _inst_;
  static getInst = () => {
    if (!RegDB._inst_) RegDB._inst_ = new RegDB();
    return RegDB._inst_;
  };

  constructor() {
    console.log("[Registration - DB] DB Init Completed");
  }

  CheckRegister = async ({ userName }) => {
    try {
      const res = await UserModel.findOne({ userName: userName }).limit(1);
      if (res === null) {
        return false;
      } else return true;
    } catch (e) {
      console.log(`[User - DB] Register Check Error: ${e}`);
      return false;
    }
  };

  CheckLogin = async ({ userName, password }) => {
    try {
      const res = await UserModel.findOne({
        UserName: userName,
        Password: password,
      }).limit(1);
      if (res === null) {
        return false;
      } else return true;
    } catch (e) {
      console.log(`[User - DB] Login Check Error: ${e}`);
      return false;
    }
  };

  AddRegister = async ({
    email,
    userName,
    password,
    description,
    profileImg,
  }) => {
    try {
      const newItem = new UserModel({
        Email: email,
        UserName: userName,
        Password: password,
        Bio: description,
        profileImg: ProfileImg,
      });
      const res = await newItem.save();
    } catch (e) {
      console.log(`[User - DB] User Init Error: ${e}`);
      return false;
    }
  };
}

const RegDBInst = RegDB.getInst();

router.get("/searchID", async (req, res) => {
  try {
    const userName = req.query.userName;
    const dbRes = await RegDBInst.CheckRegister({ userName: userName });
    if (dbRes) return res.status(0).json(true);
    else {
      return res.status(-1).json(false);
    }
  } catch (e) {
    return res.status(-1).json(false);
  }
});

router.get("/login", async (req, res) => {
  try {
    const userName = req.query.userName;
    const password = req.query.password;
    const dbRes = await RegDBInst.CheckLogin({
      userName: userName,
      password: password,
    });
    if (dbRes) return res.status(0).json(true);
    else {
      return res.status(-2).json(false);
    }
  } catch (e) {
    return res.status(-2).json(false);
  }
});

//File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "thumbnailFiles/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single("file");
//

router.post("/addRegister", upload, async (req, res) => {
  try {
    if (req.body.userName !== "" && typeof req.file !== "undefined") {
      const email = req.body.email;
      const userName = req.body.userName;
      const description = req.body.bio;
      const password = req.body.password;
      const fileName = req.file.filename;
      const dbRes = await RegDBInst.AddRegister({
        email: email,
        userName: userName,
        password: password,
        description: description,
        profileImg: fileName,
      });
      return true;
    } else return res.status(-3).json(false);
  } catch (e) {
    return res.status(-2).json(false);
  }
});

module.exports = router;
