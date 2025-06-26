const express = require("express");
const router = express.Router();
const FriendRequest = require("../../js/FriendRequest");
const User = require("../../js/user");
const verifyToken = require("../../js/auth");

// ✅ 친구 요청 보내기
router.post("/request", verifyToken, async (req, res) => {
  const { targetId } = req.body;
  const requesterId = req.user.id;

  if (requesterId === targetId) {
    return res.status(400).json({ message: "자기 자신에게 요청할 수 없습니다." });
  }

  try {
    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      target: targetId,
    });

    if (existingRequest) {
      return res.status(409).json({ message: "이미 요청을 보냈습니다." });
    }

    await FriendRequest.create({ requester: requesterId, target: targetId });
    res.status(201).json({ message: "친구 요청을 보냈습니다." });
  } catch (err) {
    console.error("친구 요청 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 친구 요청 수락
router.post("/accept", verifyToken, async (req, res) => {
  const { requesterId } = req.body;
  const currentUserId = req.user.id;

  try {
    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!request) {
      return res.status(404).json({ message: "요청을 찾을 수 없습니다." });
    }

    // 서로 친구로 추가
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: requesterId },
    });

    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { friends: currentUserId },
    });

    res.status(200).json({ message: "친구 요청을 수락했습니다." });
  } catch (err) {
    console.error("친구 수락 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 친구 요청 거절
router.post("/reject", verifyToken, async (req, res) => {
  const { requesterId } = req.body;
  const currentUserId = req.user.id;

  try {
    const deleted = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "요청을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "친구 요청을 거절했습니다." });
  } catch (err) {
    console.error("친구 거절 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 받은 친구 요청 목록 조회
router.get("/requests", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const requests = await FriendRequest.find({ target: currentUserId })
      .populate("requester", "name email");

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
});

// ✅ 친구 목록 불러오기
router.get("/list", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const user = await User.findById(currentUserId)
      .populate("friends", "name email");

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const formatted = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      email: friend.email,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ 친구 목록 불러오기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 친구 삭제
router.delete("/:friendId", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;
  const { friendId } = req.params;

  try {
    await User.findByIdAndUpdate(currentUserId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: currentUserId } });

    res.status(200).json({ message: "친구가 삭제되었습니다." });
  } catch (err) {
    console.error("❌ 친구 삭제 오류:", err);
    res.status(500).json({ message: "삭제 실패", error: err.message });
  }
});

module.exports = router;
