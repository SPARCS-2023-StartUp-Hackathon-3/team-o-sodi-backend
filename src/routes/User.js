const express = require("express");
const UserModel = require("../models/User");
const StoreModel = require("../models/Store");
const CodiModel = require("../models/Codi");
const multer = require("multer");
const { getEnabledCategories } = require("trace_events");
const { generateKey } = require("crypto");
const router = express.Router();
//const sharp = require("sharp");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

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
        ProfileImg: profileImg,
      });
      const res = await newItem.save();
    } catch (e) {
      console.log(`[User - DB] User Init Error: ${e}`);
      return false;
    }
  };

  GetCodiDump = async ({ userName }) => {
    try {
      const user = await UserModel.findOne({ userName: userName });
      const codiIdList = user.Codi;
      let finale = [];

      for (a of codiIdList) {
        const oneCodi = await CodiModel.findOne({ CodiId: a });
        finale = [...finale, oneCodi];
      }
      return finale;
    } catch (e) {}
  };

  GetCloset = async ({ userName }) => {
    try {
      const user = await UserModel.findOne({ userName: userName });
      const storeList = user.Closet;
      return storeList;
    } catch (e) {
      console.log(`[User DB] Error on Brringing User closet: ${e}`);
    }
  };

  PushCloset = async ({ userName, purchase, images }) => {
    try {
      console.log(userName + images);
      const user = await UserModel.findOne({ UserName: userName });
      const prevClosetList = user.Closet;
      if (images !== null) {
        const dbRes = await UserModel.updateOne(
          { UserName: userName },
          {
            Closet: [
              ...prevClosetList,
              {
                StoreId: "-",
                Brand: "-",
                Product: "-",
                Price: "-",
                Images: [images],
                Purchase: purchase,
              },
            ],
          }
        );
      }
    } catch (e) {}
  };

  AddCloset = async ({ userName, storeId, purchase }) => {
    try {
      const user = await UserModel.findOne({ UserName: userName });
      const store = await StoreModel.findOne({ StoreId: storeId });
      const brand = store.Brand;
      const product = store.Product;
      const price = store.Price;
      const images = store.Images;
      const prevClosetList = user.Closet;
      console.log("Added Closet for " + userName);
      if (storeId !== null && images !== null) {
        const dbRes = await UserModel.updateOne(
          { UserName: userName },
          {
            Closet: [
              ...prevClosetList,
              {
                StoreId: storeId,
                Brand: brand,
                Product: product,
                Price: price,
                Images: images,
                Purchase: purchase,
              },
            ],
          }
        );
      }
    } catch (e) {}
  };

  AddCodi = async ({ userName, clothIdList, images, codiId }) => {
    try {
      const user = await UserModel.findOne({ UserName: userName });
      let newCodi = [...user.Codi, codiId];
      const rep = await UserModel.updateItems(
        { userName: userName },
        { Codi: newCodi }
      );
      let prevStoreList = [];

      for (a of clothIdList) {
        const cloth = await StoreModel.findOne({ StoreId: a });
        prevStoreList = [...prevStoreList, cloth];
      }

      const newItem = new CodiModel({
        CodiId: codiId,
        Clothes: prevStoreList,
        Images: images,
      });
      const res = await newItem.save();
      return true;
    } catch (e) {}
  };

  GetProfile = async ({ userName }) => {
    try {
      const user = await UserModel.findOne({ UserName: userName });
      return user;
    } catch (e) {}
  };
}

const RegDBInst = RegDB.getInst();

router.post("/addCloset", async (req, res) => {
  try {
    const userName = req.body.userName;
    const storeId = req.body.storeId;
    const purchase = req.body.purchase;
    const dbRed = await RegDBInst.AddCloset({
      userName: userName,
      storeId: storeId,
      purchase: purchase,
    });
    res.status(200).end();
  } catch (e) {
    res.status(200).end();
  }
});

router.get("/searchID", async (req, res) => {
  try {
    const userName = req.query.userName;
    const dbRes = await RegDBInst.CheckRegister({ userName: userName });
    if (dbRes) return res.status(200).json(true);
    else {
      return res.status(200).json(false);
    }
  } catch (e) {
    return res.status(200).json(false);
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
    if (dbRes) return res.status(200).json(true);
    else {
      return res.status(200).json(false);
    }
  } catch (e) {
    return res.status(200).json(false);
  }
});

router.get("/getProfile", async (req, res) => {
  try {
    const userName = req.query.userName;
    const profile = await RegDBInst.GetProfile({ userName: userName });
    return res.status(200).json(profile);
  } catch (e) {}
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
      console.log(email);
      return true;
    } else return res.status(200).json(false);
  } catch (e) {
    return res.status(200).json(false);
  }
});

router.get("/getCloset", async (req, res) => {
  try {
    const data = await RegDBInst.GetCloset({
      userName: req.query.userName,
    });
    return res.status(200).json(data);
  } catch (e) {}
});

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

//Codi File Upload
const storageCodi = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "codiFiles/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploadCodi = multer({ storage: storageCodi }).single("file");
//

router.post("/addCodi", uploadCodi, async (req, res) => {
  try {
    const userName = req.body.userName;
    const clothIdList = req.body.clothIdList;
    const codiId = generateToken();
    const images = req.file.filename;
    const dbRed = AddCodi({
      userName: userName,
      clothIdList: clothIdList,
      codiId: codiId,
      images: images,
    });
    res.status(200).end();
  } catch (e) {}
});

//File Upload
const sharpStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "postFiles/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const sharpUpload = multer({ storage: sharpStorage }).single("file");
//

router.post("/camera", sharpUpload, async (req, res) => {
  console.log("GOGO");
  try {
    const fileName = req.file.filename;
    // let inputPath = "./postFiles/" + fileName;
    const images = fileName;
    const userName = req.body.userName;

    const inputPath = "~/no-bg.png";
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append(
      "image_file",
      fs.createReadStream(inputPath),
      path.basename(inputPath)
    );

    console.log("Working on Camera BG...");
    const newName = "~/team-o-sodi-backend/postFiles/k-no-bg.png";

    axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-API-Key": "EPEvH2sGu63eRhznq9XwUYsC",
      },
      encoding: null,
    })
      .then((response) => {
        if (response.status != 200)
          return console.error("Error:", response.status, response.statusText);
        fs.writeFileSync("no-bg.png", response.data);
        console.log("[WOW A] " + response.status + "/" + response.statusText);
      })
      .catch((error) => {
        console.log("[WOW B] " + response.status + "/" + response.statusText);

        return console.error("Request failed:", error);
      });

    console.log("GOGOGO");

    const dbRes = RegDBInst.PushCloset({
      userName: userName,
      purchase: "false",
      images: images, //newName,
    });
    console.log("YAH");
    return res.status(200).end();
  } catch (e) {
    console.log("wow: " + e);
    return res.status(500).end();
  }
});

router.post("/camera2", sharpUpload, async (req, res) => {
  console.log("GOGO");
  try {
    const fileName = req.file.filename;
    let inputFile = "../../sharpFiles/" + fileName;
    let outputFile = "../../sharpFiles/trim_" + fileName;
    const images = fileName;
    const userName = req.body.userName;

    const dbRes = RegDBInst.PushCloset({
      userName: userName,
      purchase: "false",
      images: images,
    });
    console.log("YAH");
    return res.status(500).end();
  } catch (e) {
    console.log("wow: " + e);
    return res.status(500).end();
  }
});

router.post("/camera3", sharpUpload, async (req, res) => {
  console.log("GOGO");
  return res.status(200).end();
});

module.exports = router;
