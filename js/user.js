const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 이메일 저장 시 소문자 변환 및 앞 뒤 공백 제거
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

// 저장 전 비밀번호 암호화
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
