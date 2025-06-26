const express = require("express");
const router = express.Router();
const verifyToken = require("../../js/auth");
const groupController = require("../../controllers/groupController");
const diaryController = require("../../controllers/diaryController");

// ✅ 그룹 생성
router.post("/", verifyToken, groupController.createGroup);

// ✅ 그룹 초대
router.post("/:groupId/invite", verifyToken, groupController.inviteUsers);

// ✅ 받은 초대 목록
router.get("/invitations", verifyToken, groupController.getInvitations);

// ✅ 초대 수락 / 거절
router.post("/:groupId/accept", verifyToken, groupController.acceptInvite);
router.post("/:groupId/reject", verifyToken, groupController.rejectInvite);

// ✅ 내가 속한 그룹 목록
router.get("/list", verifyToken, groupController.getMyGroups);

// ✅ 특정 그룹 구성원 조회
router.get("/:groupId/members", verifyToken, groupController.getGroupMembers);

// ✅ 특정 그룹의 월별 일기 통계
router.get(
  "/:groupId/diaries/count-by-date",
  verifyToken,
  diaryController.getGroupDiaryCountByDate
);

// ✅ 🔥 그룹원 삭제
router.delete("/:groupId/members/:memberId", verifyToken, groupController.removeMember);

// ✅ 🔥 그룹 삭제
router.delete("/:groupId", verifyToken, groupController.deleteGroup);

module.exports = router;