const User = require("../js/user"); // ✅ 사용자 모델 한 번만 선언
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const FriendRequest = require("../js/FriendRequest");

// 회원가입
exports.createUser = async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "이메일, 비밀번호는 필수입니다." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const user = new User({ email, name, password });
    await user.save();

    res.status(201).json({
      message: "회원가입 성공!",
      user: { email, name },
    });
  } catch (err) {
    console.error("❌ DB 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 로그인
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "이메일이 존재하지 않습니다." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // ✅ JWT 토큰 발급
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "secret-key",
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "로그인 성공",
    token, // ✅ 진짜 토큰
    user: {
      email: user.email,
      name: user.name,
    },
  });
};

// 로그인 GET 거절
exports.loginGetNotAllowed = (req, res) => {
  res.status(405).send("로그인은 POST 요청만 가능합니다");
};

// 유저 검색 (자기 자신 제외)

//친구 찾기
exports.searchUsers = async (req, res) => {
  console.log("현재 로그인된 사용자:", req.user);

  const { keyword } = req.query;
  const currentUserEmail = req.user?.email?.trim().toLowerCase();
  const currentUserId = req.user?._id;

  if (!keyword) {
    return res.status(400).json({ message: "검색어를 입력해주세요." });
  }

  try {
    const users = await User.find(
      {
        $and: [
          {
            $or: [
              { name: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } }
            ]
          },
          {
            // 현재 로그인한 사용자의 이메일과 완전히 일치하는 이메일 제외
            email: { $not: new RegExp(`^${currentUserEmail}$`, "i") }
          },
          {
            _id: { $ne: new mongoose.Types.ObjectId(currentUserId) }
          }
        ]
      },
      { password: 0 }
    );

    res.status(200).json(users);
  } catch (err) {
    console.error("🔴 친구 검색 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.sendFriendRequest = async (req, res) => {
  console.log("친구 요청", req.user, req.body);
  const requesterId = req.user.userId;
  const { targetId } = req.body;

  if (requesterId === targetId) {
    return res.status(400).json({ message: "자기 자신에게 요청할 수 없습니다." });
  }

  try {
    const exists = await FriendRequest.findOne({ requester: requesterId, target: targetId });
    if (exists) return res.status(409).json({ message: "이미 친구 요청을 보냈습니다." });

    await FriendRequest.create({ requester: requesterId, target: targetId });
    res.status(201).json({ message: "친구 요청을 보냈습니다." });
  } catch (err) {
    console.error("❌ 친구 요청 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  const currentUserId = req.user.userId;
  const { requesterId } = req.body;

  try {
    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!request) {
      return res.status(404).json({ message: "요청이 존재하지 않습니다." });
    }

    // 서로 친구 추가
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: requesterId } });
    await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: currentUserId } });

    res.status(200).json({ message: "친구 요청 수락 완료" });
  } catch (err) {
    console.error("❌ 친구 수락 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  const currentUserId = req.user.userId;
  const { requesterId } = req.body;

  try {
    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!request) {
      return res.status(404).json({ message: "요청이 존재하지 않습니다." });
    }

    res.status(200).json({ message: "친구 요청을 거절했습니다." });
  } catch (err) {
    console.error("❌ 친구 거절 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};