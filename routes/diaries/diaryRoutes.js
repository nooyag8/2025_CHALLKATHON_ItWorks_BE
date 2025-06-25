const express = require("express");
const router = express.Router();
const diaryController = require("../../controllers/diaryController");

// 날짜로 일기 조회
router.get("/date/:date", diaryController.getDiaryByDate);

router.get("/status", diaryController.getStatus);
router.post("/auto-save", diaryController.autoSave);
router.post("/temp", diaryController.saveTemp);
router.post("/create", diaryController.createDiary);

module.exports = router;