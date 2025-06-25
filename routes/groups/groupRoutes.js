const express = require("express");
const router = express.Router();
const verifyToken = require("../../js/auth");
const groupController = require("../../controllers/groupController");

router.post("/", verifyToken, groupController.createGroup);
router.post("/:groupId/invite", verifyToken, groupController.inviteUsers);
router.get("/invitations", verifyToken, groupController.getInvitations);
router.post("/:groupId/accept", verifyToken, groupController.acceptInvite);
router.post("/:groupId/reject", verifyToken, groupController.rejectInvite);
router.get("/list", verifyToken, groupController.getMyGroups);

module.exports = router;