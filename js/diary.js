const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String },
  group: { type: String },
  imageUrl: { type: String }, // 나중에 사진 업로드 추가 가능
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Diary", diarySchema);