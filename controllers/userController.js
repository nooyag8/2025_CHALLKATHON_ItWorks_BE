const User = require("../js/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const FriendRequest = require("../js/FriendRequest");

// 회원가입
exports.createUser = async (req, res) => {
  console.log("회원가입 API 호출됨:", req.method, req.path);
  console.log("req.body:", req.body);

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

  // JWT 토큰 발급
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "secret-key"
  );

  res.status(200).json({
    message: "로그인 성공",
    token,
    user: {
      email: user.email,
      name: user.name,
    },
  });
};

// 로그인 GET 막기
exports.loginGetNotAllowed = (req, res) => {
  res.status(405).send("로그인은 POST 요청만 가능합니다");
};

// 친구 검색 (로그인된 유저 제외)
exports.searchUsers = async (req, res) => {
  const { keyword } = req.query;
  const currentUserEmail = req.user?.email?.trim().toLowerCase();
  const currentUserId = req.user?._id;

  if (!keyword) {
    return res.status(400).json({ message: "검색어를 입력해주세요." });
  }

  try {
    const currentUser = await User.findById(currentUserId).select("friends");
    const friendIds = currentUser?.friends || [];

    const users = await User.find(
      {
        $and: [
          {
            $or: [
              { name: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
            ],
          },
          { email: { $ne: currentUserEmail } },
          { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } },
          { _id: { $nin: friendIds } },
        ],
      },
      { password: 0 }
    );

    res.status(200).json(users);
  } catch (err) {
    console.error("🔴 친구 검색 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 친구 요청 보내기
exports.sendFriendRequest = async (req, res) => {
  const requesterId = req.user._id;
  const { targetId } = req.body;

  if (!targetId) {
    return res.status(400).json({ message: "targetId가 없습니다." });
  }

  if (requesterId.toString() === targetId.toString()) {
    return res.status(400).json({ message: "자기 자신에게 요청할 수 없습니다." });
  }

  try {
    const exists = await FriendRequest.findOne({
      requester: new mongoose.Types.ObjectId(requesterId),
      target: new mongoose.Types.ObjectId(targetId),
    });

    if (exists) {
      return res.status(409).json({ message: "이미 친구 요청을 보냈습니다." });
    }

    await FriendRequest.create({
      requester: new mongoose.Types.ObjectId(requesterId),
      target: new mongoose.Types.ObjectId(targetId),
    });

    res.status(201).json({ message: "친구 요청을 보냈습니다." });
  } catch (err) {
    console.error("❌ 친구 요청 오류:", err.message);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

// 받은 친구 요청 불러오기
exports.getFriendRequests = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const requests = await FriendRequest.find({ target: currentUserId }).populate(
      "requester",
      "name email"
    );

    const formatted = requests.map((req) => ({
      id: req._id,
      requesterId: req.requester._id,
      name: req.requester.name,
      email: req.requester.email,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ 친구 요청 목록 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 친구 요청 수락
exports.acceptFriendRequest = async (req, res) => {
  const currentUserId = req.user._id;
  const { requesterId } = req.body;

  try {
    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!request) {
      return res.status(404).json({ message: "요청이 존재하지 않습니다." });
    }

    await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: requesterId } });
    await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: currentUserId } });

    res.status(200).json({ message: "친구 요청 수락 완료" });
  } catch (err) {
    console.error("❌ 친구 수락 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 친구 요청 거절
exports.rejectFriendRequest = async (req, res) => {
  const currentUserId = req.user._id;
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

// [GET] 내 정보
exports.getUserInfo = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

// [PATCH] 정보 수정
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      name: updated.name,
      email: updated.email,
    });
  } catch (err) {
    res.status(500).json({ message: "정보 수정 실패", error: err.message });
  }
};

// [DELETE] 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "탈퇴 실패", error: err.message });
  }
};

exports.getFriendsList = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const user = await User.findById(currentUserId).populate("friends", "name email");

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const friends = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      email: friend.email,
    }));

    res.status(200).json(friends);
  } catch (err) {
    console.error("❌ 친구 목록 불러오기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};