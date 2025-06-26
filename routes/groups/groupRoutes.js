const express = require("express");
const router = express.Router();
const verifyToken = require("../../js/auth");
const groupController = require("../../controllers/groupController");
const diaryController = require("../../controllers/diaryController");

router.post("/", verifyToken, groupController.createGroup);
router.post("/:groupId/verify-password", verifyToken, groupController.verifyGroupPassword);
router.patch("/:groupId/password", verifyToken, groupController.updateGroupPassword);

router.post("/:groupId/invite", verifyToken, groupController.inviteUsers);
router.get("/invitations", verifyToken, groupController.getInvitations);
router.post("/:groupId/accept", verifyToken, groupController.acceptInvite);
router.post("/:groupId/reject", verifyToken, groupController.rejectInvite);
router.get("/list", verifyToken, groupController.getMyGroups);
router.get("/groups/:groupId/members", verifyToken, groupController.getGroupMembers);
router.get(
    "/:groupId/diaries/count-by-date",
    verifyToken,
    diaryController.getGroupDiaryCountByDate
  );
  
module.exports = router;