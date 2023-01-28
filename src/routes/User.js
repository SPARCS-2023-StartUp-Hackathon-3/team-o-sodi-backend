const express = require("express");
const UserModel = require("../models/User");
const StoreModel = require("../models/Store");
const CodiModel = require("../models/Codi");
const fs = require("fs");
const multer = require("multer");
const { getEnabledCategories } = require("trace_events");
const { generateKey } = require("crypto");
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

  AddCloset = async ({ userName, storeId }) => {
    try {
      const user = await UserModel.findOne({ UserName: userName });
      const store = await StoreModel.findOne({ StoreId: storeId });
      const brand = store.Brand;
      const product = store.Product;
      const price = store.Price;
      const images = store.images;
      const prevClosetList = user.Closet;
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
            },
          ],
        }
      );
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
    const dbRed = AddCloset({ userName: userName, storeId: storeId });
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

//For Debug
// const a = RegDBInst.AddRegister({
//   email: "hajun@chang",
//   userName: "Hajun",
//   description: "Tired",
//   password: "killme",
//   profileImg: "doge",
// });
// const b = RegDBInst.AddRegister({
//   email: "Mar@io",
//   userName: "Mario",
//   description: "Flower",
//   password: "Yahoo",
//   profileImg: "DDD",
// });
//

// const a = RegDBInst.AddCloset({
//   userName: "Hajun",
//   storeId: "store1",
//   brand: "Nike",
//   product: "Shoe",
//   price: 100,
//   images: "shoeImg",
// });

module.exports = router;
