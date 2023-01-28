const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
// const fs = require("fs");
require("dotenv").config();
const http = require("http");
const bodyParser = require("body-parser");
const userRouter = require("./routes/User");
const postsRouter = require("./routes/Posts");
const storeRouter = require("./routes/Store");
const commentsRouter = require("./routes/Comments");
const purchaseRouter = require("./routes/Purchase");

const app = express();
const port = 8080;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const whiteList = [
  "http://172.31.33.237:3000",
  "43.201.75.12",
  "http://43.201.75.12",
  "43.201.75.12:3000",
  "http://43.201.75.12:3000",
];
const corsOptions = {
  origin: (origin, callback) => {
    console.log("[REQUEST-CORS] Request from origin: ", origin);
    if (!origin || whiteList.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not Allowed by CORS"));
  },
  credentials: true,
};

// app.use(cors(corsOptions));

app.use("/posts", postsRouter);
app.use("/store", storeRouter);
app.use("/comments", commentsRouter);
app.use("/loginRouter", userRouter);
app.use("/purchase", purchaseRouter);

app.use("/postImg", express.static(path.join(__dirname, "../postFiles")));
app.use(
  "/thumbnailImg",
  express.static(path.join(__dirname, "../thumbnailFiles"))
);
app.use("/codiImg", express.static(path.join(__dirname, "../codiFiles")));
app.use("/storeImg", express.static(path.join(__dirname, "../storeFiles")));

const OMongooseOption = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose
  .connect(
    "mongodb://sparcs:SrCy4zAEDPvZgWMEPg4gAHzG@team-o.cyabzp8jcj3s.ap-northeast-2.docdb.amazonaws.com:27017/?tls=true&tlsAllowInvalidCertificates=true&retryWrites=false",
    OMongooseOption
  )
  .then(
    () => {
      console.log("[Mongoose] Connection Complete!");
    },
    (err) => {
      console.log(`[Mongoose] Connection Error: ${err}`);
    }
  );

const server = http.createServer(app);
server.listen(port, async () => {
  console.log(`[App Listen] Listening @ http://172.31.33.237:${port}`);
});

app.get("/", (req, res) => {
  console.log("WOW");
  res.send("졸리네요");
});
