const express = require("express");
const router = express.Router();
const diaryController = require("../../controllers/diaryController");
const verifyToken = require("../../js/auth"); 

// 날짜로 일기 조회
router.get("/date/:date", verifyToken, (req, res, next) => {
  console.log("📅 요청된 날짜:", req.params.date);
  next();
}, diaryController.getDiaryByDate);

router.get("/status", diaryController.getStatus);
router.post("/auto-save", diaryController.autoSave);
router.post("/temp", diaryController.saveTemp);
router.post("/create", diaryController.createDiary);

router.post("/:id/read", verifyToken, diaryController.markAsRead);
router.get('/count-by-date', diaryController.getDiaryCountByDate);

module.exports = router;