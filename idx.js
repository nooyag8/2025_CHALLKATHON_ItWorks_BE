const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// 테스트용 라우터
app.get("/", (req, res) => {
  res.send("🎉 Reletter 백엔드 서버 실행 중!");
});

// ✅ 회원가입 API
app.post("/users/create", (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일, 비밀번호는 필수입니다." });
  }

  console.log("✅ 회원가입 요청:", req.body);

  //TODO: 실제 DB 저장 로직 추가

  res.status(201).json({
    message: "회원가입 성공!",
    user: { email, name },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
