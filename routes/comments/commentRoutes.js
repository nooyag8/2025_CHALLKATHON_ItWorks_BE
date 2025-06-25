const express = require("express");
const router = express.Router();
const commentController = require("../../controllers/commentController");
const verifyToken = require("../../js/auth");

router.get("/:diaryId/comments", verifyToken, commentController.getComments);
router.post("/:diaryId/comments", verifyToken, commentController.addComment);

module.exports = router;
