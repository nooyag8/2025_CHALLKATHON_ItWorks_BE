const Group = require("../js/Group");
const User = require("../js/user");

// 그룹 생성
exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const leaderId = req.user.id;

  try {
    const group = new Group({
      name,
      leader: leaderId,
      members: [leaderId],
      invitations: [],
    });

    await group.save();
    res.status(201).json({ groupId: group._id });
  } catch (err) {
    console.error("❌ 그룹 생성 오류:", err);
    res.status(500).json({ message: "그룹 생성 실패" });
  }
};

// 그룹에 사용자 초대
exports.inviteUsers = async (req, res) => {
  const { groupId } = req.params;
  const { userEmails } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "그룹을 찾을 수 없음" });

    const users = await User.find({ email: { $in: userEmails } });
    users.forEach((user) => {
      if (
        !group.invitations.includes(user._id) &&
        !group.members.includes(user._id)
      ) {
        group.invitations.push(user._id);
      }
    });

    await group.save();
    res.json({ message: "초대 완료" });
  } catch (err) {
    console.error("❌ 초대 오류:", err);
    res.status(500).json({ message: "초대 실패" });
  }
};

// 초대 목록 조회
exports.getInvitations = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await Group.find({ invitations: userId }).populate("leader", "name");

    const result = groups.map((group) => ({
      groupId: group._id,
      groupName: group.name,
      inviterName: group.leader.name,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ 초대 목록 오류:", err);
    res.status(500).json({ message: "초대 목록 불러오기 실패" });
  }
};

// 초대 수락
exports.acceptInvite = async (req, res) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "그룹 없음" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    group.invitations = group.invitations.filter(
      (id) => id.toString() !== userId
    );

    await group.save();
    res.json({ message: "초대 수락" });
  } catch (err) {
    console.error("❌ 초대 수락 오류:", err);
    res.status(500).json({ message: "수락 실패" });
  }
};

// 초대 거절
exports.rejectInvite = async (req, res) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "그룹 없음" });

    group.invitations = group.invitations.filter(
      (id) => id.toString() !== userId
    );

    await group.save();
    res.json({ message: "초대 거절" });
  } catch (err) {
    console.error("❌ 초대 거절 오류:", err);
    res.status(500).json({ message: "거절 실패" });
  }
};

exports.getMyGroups = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const groups = await Group.find({ members: userId })
        .populate("leader", "name")
        .select("name leader members");
  
      res.json(groups);
    } catch (err) {
      console.error("❌ 그룹 목록 불러오기 실패:", err);
      res.status(500).json({ message: "그룹 목록 불러오기 실패" });
    }
  };  

exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  try {
    // 그룹이 존재하는지 확인
    const group = await Group.findById(groupId).populate("members", "name email"); // members는 User ID 배열로 가정
    if (!group) {
      return res.status(404).json({ message: "그룹을 찾을 수 없습니다." });
    }

    // 구성원 목록 응답
    res.status(200).json({
      members: group.members.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        // 필요한 정보만 추려서 보내기
      })),
    });
  } catch (error) {
    console.error("🔴 그룹 구성원 조회 오류:", error);
    res.status(500).json({ message: "서버 오류로 구성원을 불러올 수 없습니다." });
  }
};