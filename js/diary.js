const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const diarySchema = new Schema({
  title: String,
  content: String,
  date: String,
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: String,
  readBy: [String],
  isTemp: { type: Boolean, default: false },
  comments: [commentSchema], // ✅ 댓글 필드 추가
});

module.exports = mongoose.model("Diary", diarySchema);
