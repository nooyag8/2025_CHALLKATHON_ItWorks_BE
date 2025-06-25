require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users/userRoutes");
const diaryRoutes = require("./routes/diaries/diaryRoutes");
const groupRoutes = require("./routes/groups/groupRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ MongoDB 연결
connectDB();

// ✅ 미들웨어
app.use(cors());
app.use(express.json());

// ✅ 기본 라우트
app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// ✅ 라우트 등록
app.use("/users", userRoutes); // 사용자 관련 API
app.use("/users/groups", groupRoutes); // 그룹 관련 API
app.use("/diaries", diaryRoutes); // 일기 관련 API

// ✅ 로그
console.log("✅ User routes mounted at /users");
console.log("✅ Group routes mounted at /groups");
console.log("✅ Diary routes mounted at /diaries");

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});