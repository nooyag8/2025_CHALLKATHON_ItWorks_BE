const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../js/user.js"); // User 모델 경로 확인

const router = express.Router();

// ✅ 회원가입
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, name, password: hashed });
    await user.save();

    return res.status(201).json({ message: "회원가입 성공!" });
  } catch (err) {
    return res.status(500).json({ message: "서버 에러", error: err.message });
  }
});

// ✅ 로그인 및 토큰 발급
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "secret-key", // 실제 서비스에서는 .env 사용
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "로그인 성공!",
      token,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "서버 에러", error: err.message });
  }
});

// 🔒 인증 미들웨어 (추가)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

// export에 추가
module.exports = {
  signupRouter: router,
  verifyToken,
};
