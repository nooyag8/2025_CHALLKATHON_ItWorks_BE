const jwt = require("jsonwebtoken");
const User = require("./user.js"); // User 모델 경로 확인

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "토큰이 없습니다" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰이 없습니다" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");
    console.log("decoded user:", decoded);
    const user = await User.findById(decoded.userId).select("-password");
    console.log("DB user:", user);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });

    req.user = user;
    next();
  } catch (err) {
    console.error("토큰 검증 오류:", err.message);
    return res.status(403).json({ message: "토큰 검증 실패" });
  }
};

module.exports = {
  verifyToken,
};