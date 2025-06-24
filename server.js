const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // DB 연결
const userRoutes = require("./routes/users/userRoutes");
const friendRoutes = require("./routes/users/friends");
const { signupRouter } = require("./js/auth"); // 회원가입/로그인 라우터

const app = express();
const PORT = 4000;

connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// 경로 분리
app.use("/auth", signupRouter);   // 회원가입, 로그인
app.use("/users", userRoutes);    // 친구 요청, 검색 등
app.use("/users", friendRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});