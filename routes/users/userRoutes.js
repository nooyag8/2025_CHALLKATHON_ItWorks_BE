const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const authMiddleware = require("../../js/auth");

router.post("/create", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/login", userController.loginGetNotAllowed);
router.get("/search", authMiddleware, userController.searchUsers);

module.exports = router;