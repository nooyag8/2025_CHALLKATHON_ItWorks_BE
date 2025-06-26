const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const verifyToken = require("../../js/auth");

// 회원가입
router.post("/create", userController.createUser);

// 로그인
router.post("/login", userController.loginUser);

// 로그인 GET 막기
router.get("/login", userController.loginGetNotAllowed);

// 친구 기능 (인증 필요)
router.get("/search", verifyToken, userController.searchUsers);
router.get("/friends/requests", verifyToken, userController.getFriendRequests);
router.post("/friends/request", verifyToken, userController.sendFriendRequest);
router.post("/friends/accept", verifyToken, userController.acceptFriendRequest);
router.post("/friends/reject", verifyToken, userController.rejectFriendRequest);
router.get("/friends/list", verifyToken, userController.getFriendsList);
router.get("/me", verifyToken, userController.getCurrentUser);

// 마이페이지 (인증 필요)
router.get("/info", verifyToken, userController.getUserInfo);
router.patch("/update", verifyToken, userController.updateUser);
router.delete("/me", verifyToken, userController.deleteUser);

// 사용자 정보 조회 (인증 필요)
router.get("/me", verifyToken, userController.getCurrentUser);


module.exports = router;