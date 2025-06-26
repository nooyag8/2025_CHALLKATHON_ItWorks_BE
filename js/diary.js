const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ✅ 댓글 스키마 정의
const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ 일기 스키마 정의
const diarySchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD 형식 문자열
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ 이미지 Base64 문자열 저장
  imageBase64: { type: String, default: null },

  // ✅ 읽음 처리
  readBy: [String],

  // ✅ 임시 저장 여부
  isTemp: { type: Boolean, default: false },

  // ✅ 댓글 목록
  comments: [commentSchema],
});

module.exports = mongoose.model("Diary", diarySchema);