const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users/userRoutes");
const friendRoutes = require("./routes/users/friends");
const { signupRouter } = require("./js/auth"); // 회원가입/로그인 라우터

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// 경로 분리
app.use("/auth", signupRouter);   // 회원가입, 로그인
app.use("/users", userRoutes);    // 사용자 관련 (검색, 정보조회 등)
app.use("/users", friendRoutes);  // 친구 요청 등

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});