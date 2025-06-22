const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 테스트용 라우터
app.get('/', (req, res) => {
  res.send('🎉 Reletter 백엔드 서버 실행 중!');
});

// ✅ 회원가입 API
app.post('/users/create', (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: '이메일과 이름은 필수입니다.' });
  }

  console.log('✅ 회원가입 요청:', req.body);

  res.status(201).json({
    message: '회원가입 성공!',
    user: { email, name },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
