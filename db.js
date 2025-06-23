const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/reletter", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => {
  console.log("✅ MongoDB 연결 성공");
});

module.exports = db;
