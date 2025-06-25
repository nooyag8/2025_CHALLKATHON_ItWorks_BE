const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  date: { type: String, required: true }, // "YYYY-MM-DD" 형식
  group: { type: String },
  imageUrl: { type: String },
  readBy: { type: [String], default: [] },
});

module.exports = mongoose.model("diaries", diarySchema);