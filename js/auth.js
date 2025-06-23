const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../js/user.js');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    return res.status(201).json({ message: '회원가입 성공!' });
  } catch (err) {
    return res.status(500).json({ message: '서버 에러', error: err.message });
  }
});

module.exports = router;
