require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

// DB 연결
connectDB();

app.use(cors());
app.use(express.json());

// 라우터
const userRoutes = require("./routes/users/userRoutes");
app.use("/users", userRoutes);

// 기본 테스트 라우터
app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});