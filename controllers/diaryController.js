const Diary = require("../js/diary");
const mongoose = require('mongoose');

let currentStatus = "작성 중";

// ✅ 작성 상태 반환
exports.getStatus = (req, res) => {
  res.json({ status: currentStatus });
};

// ✅ 날짜로 일기 조회 (그룹명 포함 & 제목 사용)
exports.getDiaryByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // 그룹 이름 포함하여 불러오기
    const diaries = await Diary.find({ date }).populate("group", "name");

    if (!diaries || diaries.length === 0) {
      return res.status(404).json({ message: "해당 날짜에 일기가 없습니다." });
    }

    // 그룹 기준으로 그룹핑
    const groupMap = new Map();

    diaries.forEach((diary) => {
      const groupId = diary.group?._id?.toString() || "etc";
      const groupName = diary.group?.name || "기타";

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          id: groupId,
          groupName: groupName,
          entries: [],
        });
      }

      groupMap.get(groupId).entries.push({
        id: diary._id,
        title: diary.title,
        imageUrl: diary.imageUrl || null,
        previewText: diary.title, // ✅ 제목을 previewText로 사용
      });
    });

    const groupedDiaries = Array.from(groupMap.values());
    res.status(200).json(groupedDiaries);
  } catch (err) {
    console.error("❌ 일기 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// ✅ 읽기 정보 조회
exports.getReadInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const diary = await Diary.findById(id);

    if (!diary) {
      return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
    }

    res.status(200).json({ readBy: diary.readBy || [] });
  } catch (err) {
    console.error("❌ 읽기 정보 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// ✅ 읽음 처리
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;

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

// ✅ 자동 저장 처리
exports.autoSave = async (req, res) => {
  const { title, content } = req.body;

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const updated = await Diary.findOneAndUpdate(
      { date: today, isTemp: true },
      {
        title,
        content,
        savedAt: now,
      },
      {
        new: true,      // 업데이트된 문서 반환
        upsert: true,   // 없으면 새로 생성
      }
    );

    await diary.save();
    console.log("📝 [Auto-Save] 제목:", title, "| 내용:", content);
    currentStatus = "자동 저장됨";

    res.status(200).json({ message: "자동 저장 완료", diary });
  } catch (err) {
    res.status(500).json({ message: "자동 저장 실패", error: err.message });
  }
};

// ✅ 임시 저장
exports.saveTemp = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user._id; // 미들웨어에서 주입됨
  const today = new Date().toISOString().split("T")[0];

  try {
    const tempDiary = await Diary.findOneAndUpdate(
      { user: userId, date: today, isTemp: true },
      {
        title,
        content,
        user: userId,
        date: today,
        isTemp: true,
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("🗂 [Temp Save] 저장 완료:", tempDiary);
    res.status(200).json({ message: "임시 저장 완료", diary: tempDiary });
  } catch (err) {
    console.error("❌ 임시 저장 실패:", err);
    res.status(500).json({ message: "임시 저장 실패", error: err.message });
  }
};

// ✅ 일기 생성
exports.createDiary = async (req, res) => {
  const { title, content, date, group } = req.body;

  try {
    const newDiary = new Diary({
      title,
      content,
      date,
      group,
    });

    await newDiary.save();
    console.log("📥 [Create Diary] 저장 완료:", newDiary);
    currentStatus = "작성 완료됨";

    res.status(201).json({ message: "일기 생성 완료", diary: newDiary });
  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.getDiaryCount = async (req, res) => {
  try {
    const totalCount = await Diary.countDocuments({});
    res.json({ totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "총 일기 개수를 가져올 수 없습니다." });
  }
};