const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();
const http = require("http");

const app = express();
const port = 8080;
app.use(express.json());

const loginRouter = require("./routes/Login");
const postsRouter = require("./routes/Posts");
//const storeRouter = require("./routes/Store");
const commentsRouter = require("./routes/Comments");

const router = express.Router();

const whiteList = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    console.log("[REQUEST-CORS] Request from origin: ", origin);
    if (!origin || whiteList.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not Allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/posts", postsRouter);
//app.use("/store", storeRouter);
app.use("/comments", commentsRouter);
app.use("/loginRouter", loginRouter);

const OMongooseOption = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect("mongodb://localhost:27017/SODI", OMongooseOption).then(
  () => {
    console.log("[Mongoose] Connection Complete!");
  },
  (err) => {
    console.log(`[Mongoose] Connection Error: ${err}`);
  }
);

const server = http.createServer(app);
server.listen(port, async () => {
  console.log(`[App Listen] Listening @ http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("졸리네요");
});
