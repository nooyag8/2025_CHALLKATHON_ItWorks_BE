const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const authMiddleware = require("../../js/auth");
const { verifyToken } = require("../../js/auth");

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/login", userController.loginGetNotAllowed);
//router.get("/search", authMiddleware, userController.searchUsers);
router.get("/search", verifyToken, userController.searchUsers);
router.post("/friends/request", verifyToken, userController.sendFriendRequest);
router.post("/friends/accept", verifyToken, userController.acceptFriendRequest);
router.post("/friends/reject", verifyToken, userController.rejectFriendRequest);
module.exports = router;