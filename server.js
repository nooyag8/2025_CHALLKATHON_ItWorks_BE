const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./js/user"); // 사용자 모델 import
require("./db"); // DB 연결

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// ✅ 회원가입 API (DB 저장 추가됨)
app.post("/users/create", async (req, res) => {
  console.log("req.body:", req.body);
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일, 비밀번호는 필수입니다." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const user = new User({ email, name, password });
    await user.save();

    res.status(201).json({
      message: "회원가입 성공!",
      user: { email, name },
    });
  } catch (err) {
    console.error("❌ DB 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

const bcrypt = require("bcrypt");

app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "이메일이 존재하지 않습니다." });
  }

  const isMatch = await bcrypt.compare(password, user.password); // 🔐 암호화된 비번 비교

  if (!isMatch) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  res.status(200).json({
    message: "로그인 성공",
    user: {
      email: user.email,
      name: user.name,
    },
    accessToken: "fake-access-token",
    refreshToken: "fake-refresh-token",
  });
});

app.get("/users/login", (req, res) => {
  res.status(405).send("로그인은 POST 요청만 가능합니다");
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
