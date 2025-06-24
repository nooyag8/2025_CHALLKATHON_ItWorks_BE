const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // DB 연결
const userRoutes = require("./routes/users/userRoutes");

const app = express();
const PORT = 4000;

connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});