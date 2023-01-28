const express = require("express");
const RegisterModel = require("../models/User");
const StoreModel = require("../models/Store");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

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

class StoreDB {
  static _inst_;
  static getInst = () => {
    if (!StoreDB._inst_) StoreDB._inst_ = new StoreDB();
    return StoreDB._inst_;
  };

  constructor() {
    console.log("[Store - DB] DB Init Completed");
  }

  GetStore = async () => {
    try {
      const dbRes = await StoreModel.find();
      return dbRes;
    } catch (e) {}
  };

  GetSpecificStore = async ({ storeId }) => {
    try {
      const specificStore = await StoreDBInst.findOne({ StoreId: storeId });
      return specificStore;
    } catch (e) {}
  };

  AddStore = async ({ storeId, brand, product, price, images }) => {
    try {
      const newItem = new StoreModel({
        StoreId: storeId,
        Brand: brand,
        Product: product,
        Images: images,
        Price: price,
      });
      const res = await newItem.save();
      return true;
    } catch (e) {
      console.log(`[Store-DB] Add Store Error: ${e}`);
      return false;
    }
  };
}

const StoreDBInst = StoreDB.getInst();
// router.get("/getStore", async (req, res) => {
//   try {
//     const { data } = await StoreDBInst.GetStore();
//     return res.status(0).json(data);
//   } catch (e) {}
// });

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

router.post("/addStore", multi_upload.array("img"), async (req, res) => {
  try {
    console.log(req.body);
    const storeId = generateToken();
    const brand = req.body.brand;
    const product = req.body.product;
    const price = req.body.price;
    const images = req.files.map((a) => a.filename); //?
    const dbRes = StoreDBInst.AddStore({
      storeId: storeId,
      brand: brand,
      product: product,
      price: price,
      images: images,
    });
    res.status(200).end();
  } catch (e) {}
});

router.get("/getStore", async (req, res) => {
  try {
    const data = await StoreDBInst.GetStore();
    return res.status(200).json(data);
  } catch (e) {
    console.log(`[Store DB] Error on getting Store: ${e}`);
    return res.status(200).json([]);
  }
});

router.get("/getSpecificStore", async (req, res) => {
  try {
    const data = await StoreDBInst.GetSpecificStore(req.query.storeId);
    return res.status(200).json(data);
  } catch (e) {
    console.log(`[Store DB] Error on getting Store: ${e}`);
    return res.status(200).json([]);
  }
});

module.exports = router;
