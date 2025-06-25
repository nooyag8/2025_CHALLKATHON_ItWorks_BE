require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users/userRoutes");
//console.log("✅ userRoutes");
const diaryRoutes = require("./routes/diaries/diaryRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// 유저 라우트 등록
app.use("/users", userRoutes);
console.log("✅ User routes registered under /users");

// 일기 라우트 등록
app.use("/diaries", diaryRoutes);
console.log("✅ Diary routes registered under /diaries");

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});