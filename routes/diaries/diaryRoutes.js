const express = require("express");
const router = express.Router();
const diaryController = require("../../controllers/diaryController");
const verifyToken = require("../../js/auth"); 

// ✅ 작성 상태 조회
router.get("/status", diaryController.getStatus);

// ✅ 날짜별 일기 조회 (내가 속한 그룹의 일기만)
router.get("/date/:date", verifyToken, (req, res, next) => {
  console.log("📅 요청된 날짜:", req.params.date);
  next();
}, diaryController.getDiaryByDate);

// ✅ 월별 일기 개수 조회
router.get("/count-by-date", verifyToken, diaryController.getDiaryCountByDate);

// ✅ 전체 일기 수 조회
router.get("/count", diaryController.getDiaryCount);

// ✅ 특정 그룹의 일기 목록 조회
router.get("/group/:groupId", verifyToken, diaryController.getDiariesByGroup);

// ✅ 일기 상세 조회
router.get("/:id", verifyToken, diaryController.getDiaryById);

// ✅ 일기 읽음 정보 조회
router.get("/:id/read", verifyToken, diaryController.getReadInfo);

// ✅ 읽음 처리
router.post("/:id/read", verifyToken, diaryController.markAsRead);

// ✅ 일기 생성
router.post("/create", verifyToken, diaryController.createDiary);

// ✅ 임시 저장
router.post("/temp", verifyToken, diaryController.saveTemp);

// ✅ 자동 저장
router.post("/auto-save", verifyToken, diaryController.autoSave);

// ✅ 월별 일기 통계 조회
//router.get("/stats", verifyToken, diaryController.getDiaryStatsByMonth);

module.exports = router;