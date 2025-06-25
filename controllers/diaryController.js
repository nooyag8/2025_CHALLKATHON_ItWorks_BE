const Diary = require("../js/diary");

let currentStatus = "작성 중";

exports.getStatus = (req, res) => {
  res.json({ status: currentStatus });
};

// 날짜로 일기 조회 함수 추가
exports.getDiaryByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const diaries = await Diary.find({ date });
    if (!diaries || diaries.length === 0) {
      return res.status(404).json({ message: "해당 날짜에 일기가 없습니다." });
    }
    res.json({ diaries });
  } catch (err) {
    console.error("❌ 일기 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.autoSave = (req, res) => {
  const { title, content } = req.body;
  console.log("📝 [Auto-Save] 제목:", title, "| 내용:", content);
  currentStatus = "자동 저장됨";
  res.status(200).json({ message: "자동 저장 완료" });
};

exports.saveTemp = (req, res) => {
  const { title, content } = req.body;
  console.log("🗂 [Temp Save] 제목:", title, "| 내용:", content);
  currentStatus = "임시 저장됨";
  res.status(200).json({ message: "임시 저장 완료" });
};

exports.createDiary = async (req, res) => {
  const { title, content, date, group } = req.body;

  try {
    const newDiary = new Diary({
      title,
      content,
      date,
      group,
    });

    await newDiary.save();  // ⬅️ 실제 MongoDB 저장
    console.log("📥 [Create Diary] 저장 완료:", newDiary);
    currentStatus = "작성 완료됨";

    res.status(201).json({ message: "일기 생성 완료", diary: newDiary });
  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};