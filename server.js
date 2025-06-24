const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // DB 연결
const userRoutes = require("./routes/users/userRoutes");
const { signupRouter } = require("./js/auth"); // verifyToken 포함된 객체에서 라우터만 구조 분해

const app = express();
const PORT = 4000;

connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// 사용자 관련 라우터
app.use("/users", signupRouter);   // 회원가입/로그인 라우터 (auth.js)
app.use("/users", userRoutes);     // 친구 요청/검색 등 (userRoutes.js)

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});