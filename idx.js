const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// JSON 형태의 요청 바디 파싱
app.use(bodyParser.json());
// 또는 app.use(express.json()); // Express 4.16+부터 가능

// 기본 라우터 예시
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});