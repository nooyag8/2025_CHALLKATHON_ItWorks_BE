const jwt = require("jsonwebtoken");
const User = require("./user.js"); // User 모델 경로

// 인증 미들웨어 함수
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰이 없습니다" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 유효하지 않습니다" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }

    req.user = user; // 요청 객체에 사용자 정보 저장
    next();
  } catch (err) {
    console.error("토큰 검증 오류:", err.message);
    return res.status(403).json({ message: "유효하지 않은 토큰입니다" });
  }
};

// ✅ 미들웨어로 export
module.exports = verifyToken;