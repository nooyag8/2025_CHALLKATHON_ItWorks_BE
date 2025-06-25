const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
console.log("user.js loded");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// ✅ 이메일 저장 전: 소문자 변환 + 공백 제거
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

// ✅ 비밀번호 저장 전: bcrypt 해싱
userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    this.email = this.email.trim().toLowerCase();
  }

  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// ✅ 비밀번호 비교 메서드
userSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
