const express = require("express");
const router = express.Router();
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

// 친구 요청 보내기
router.post("/request", async (req, res) => {
  const { targetId } = req.body;
  const requesterId = req.user.id;

  if (requesterId === targetId) {
    return res.status(400).json({ message: "자기 자신에게 요청 불가" });
  }

  try {
    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      target: targetId,
    });
    if (existingRequest) {
      return res.status(409).json({ message: "이미 요청 보냄" });
    }

    await FriendRequest.create({ requester: requesterId, target: targetId });
    res.status(201).json({ message: "요청 보냄" });
  } catch (err) {
    console.error("친구 요청 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 친구 요청 수락
router.post("/accept", async (req, res) => {
  const { requesterId } = req.body;
  const currentUserId = req.user.id;

  try {
    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!request) {
      return res.status(404).json({ message: "요청 없음" });
    }

    // 서로 친구 추가
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: requesterId },
    });
    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { friends: currentUserId },
    });

    res.status(200).json({ message: "친구 수락 완료" });
  } catch (err) {
    console.error("친구 수락 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 친구 요청 거절
router.post("/reject", async (req, res) => {
  const { requesterId } = req.body;
  const currentUserId = req.user.id;

  try {
    const deleted = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      target: currentUserId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "요청 없음" });
    }

    res.status(200).json({ message: "요청 거절됨" });
  } catch (err) {
    console.error("친구 거절 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
