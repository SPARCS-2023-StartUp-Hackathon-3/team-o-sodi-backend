const express = require("express");
const multer = require("multer");
const RegisterModel = require("../models/User");
const PurchaseModel = require("../models/Purchase");
const path = require("path");
const fs = require("fs");
const StoreModel = require("../models/Store");
const router = express.Router();

class PurchaseDB {
  static _inst_;
  static getInst = () => {
    if (!PurchaseDB._inst_) PurchaseDB._inst_ = new PurchaseDB();
    return PurchaseDB._inst_;
  };

  constructor() {
    console.log("[Purchase - DB] DB Init Completed");
  }

  AddPurchase = async ({ purchaseId, userName, storeId, date }) => {
    try {
      const store = await StoreModel.findOne({ StoreId: storeId });
      const price = store.Price;
      const product = store.Product;
      const brand = store.Brand;
      const images = store.Imagees;
      const newItem = new PurchaseModel({
        PurchaseId: purchaseId,
        UserName: userName,
        Brand: brand,
        Product: product,
        StoreId: storeId,
        Price: price,
        Images: images,
        Date: date,
      });
      const res = await newItem.save();
    } catch (e) {}
  };
  GetSpecificPurchase = async ({ purchaseId }) => {
    try {
      const thePurchase = await PurchaseModel.findOne({
        PurchaseId: purchaseId,
      });
      return thePurchase;
    } catch (e) {}
  };

  GetPurchase = async ({ userName }) => {
    try {
      console.log(userName);
      const purchaseList = await PurchaseModel.find({ UserName: userName });
      return purchaseList;
    } catch (e) {}
  };
}

const PurchaseDBInst = PurchaseDB.getInst();

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

router.post("/addPurchase", async (req, res) => {
  try {
    const purchaseId = generateToken();
    console.log(req);
    const userName = req.body.userName;
    const storeId = req.body.storeId;
    const date = currentTime();
    console.log(userName);
    const dbRes = await PurchaseDBInst.AddPurchase({
      purchaseId: purchaseId,
      userName: userName,
      storeId: storeId,
      date: date,
    });
    return res.status(200).end();
  } catch (e) {
    return res.status(200).end();
  }
});

router.get("/myPurchase", async (req, res) => {
  try {
    const myPurchase = await PurchaseDBInst.GetPurchase({
      userName: req.query.userName,
    });
    return res.status(200).json(myPurchase);
  } catch (e) {
    return res.status(200).json([]);
  }
});

router.get("/specificPurchase", async (req, res) => {
  try {
    const specialPurchase = await PurchaseDBInst.GetSpecificPurchase({
      purchaseId: req.query.purchaseId,
    });
    return res.status(200).json(specialPurchase);
  } catch (e) {
    return res.status(200).json([]);
  }
});

module.exports = router;
