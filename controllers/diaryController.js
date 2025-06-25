const Diary = require("../js/diary");

let currentStatus = "작성 중";

exports.getStatus = (req, res) => {
  res.json({ status: currentStatus });
};

// 날짜로 일기 조회 함수 추가
exports.getDiaryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const diaries = await Diary.find({ date });

    if (!diaries || diaries.length === 0) {
      return res.status(404).json({ message: "해당 날짜에 일기가 없습니다." });
    }

    // 👉 group 기준으로 그룹핑
    const groupMap = new Map();

    diaries.forEach((diary) => {
      const groupName = diary.group || "기타";
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          id: groupName, // 그룹명을 id로 사용
          groupName: groupName,
          entries: [],
        });
      }
      groupMap.get(groupName).entries.push({
        id: diary._id,
        title: diary.title,
        imageUrl: diary.imageUrl || null,
        previewText: diary.content.slice(0, 50),
      });
    });

    const groupedDiaries = Array.from(groupMap.values());

    res.status(200).json(groupedDiaries);
  } catch (err) {
    console.error("❌ 일기 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.getReadInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const diary = await Diary.findById(id);

    if (!diary) {
      return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
    }

    // 예시: readBy 필드가 존재하는 경우
    res.status(200).json({ readBy: diary.readBy || [] });
  } catch (err) {
    console.error("❌ 읽기 정보 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email; // JWT 인증 필요

    if (!userEmail) {
      return res.status(401).json({ message: "인증 실패" });
    }

    const diary = await Diary.findById(id);

    if (!diary) {
        return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
    }

    if (!diary.readBy.includes(userEmail)) {
      diary.readBy.push(userEmail);
      await diary.save();
    }

    res.status(200).json({ message: "읽음 처리 완료", readBy: diary.readBy });
  } catch (err) {
    console.error("❌ 읽음 처리 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.autoSave = (req, res) => {
  const { title, content } = req.body;
  console.log("📝 [Auto-Save] 제목:", title, "| 내용:", content);
  currentStatus = "자동 저장됨";
  res.status(200).json({ message: "자동 저장 완료" });
};

exports.saveTemp = async (req, res) => {
  const { title, content } = req.body;

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const tempDiary = new Diary({
      title,
      content,
      date: today,
      isTemp: true, // ✅ 임시 저장 표시
    });

    await tempDiary.save(); // ⬅️ 실제 DB 저장

    console.log("🗂 [Temp Save] 저장 완료:", tempDiary);
    currentStatus = "임시 저장됨";
    res.status(200).json({ message: "임시 저장 완료", diary: tempDiary });
  } catch (err) {
    console.error("❌ 임시 저장 실패:", err);
    res.status(500).json({ message: "임시 저장 실패", error: err.message });
  }
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