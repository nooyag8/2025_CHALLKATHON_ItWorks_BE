const Diary = require("../js/diary");
const Group = require("../js/Group");
const mongoose = require('mongoose');

let currentStatus = "작성 중";

// ✅ 작성 상태 반환
exports.getStatus = (req, res) => {
  res.json({ status: currentStatus });
};

// ✅ 날짜로 일기 조회 (내가 속한 그룹만)
exports.getDiaryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "인증된 사용자만 접근 가능합니다." });
    }

    const myGroups = await Group.find({ members: userId }).select("_id name");
    const myGroupIds = myGroups.map((g) => g._id);

    const diaries = await Diary.find({
      date,
      group: { $in: myGroupIds },
    }).populate("group", "name");

    if (!diaries.length) {
      return res.status(404).json({ message: "해당 날짜에 일기가 없습니다." });
    }

    const groupMap = new Map();
    diaries.forEach((diary) => {
      const groupId = diary.group?._id?.toString() || "etc";
      const groupName = diary.group?.name || "기타";

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          id: groupId,
          groupName,
          entries: [],
        });
      }

      groupMap.get(groupId).entries.push({
        id: diary._id,
        title: diary.title,
        imageUrl: diary.imageUrl || null,
        previewText: diary.title,
      });
    });

    const grouped = Array.from(groupMap.values());
    res.status(200).json(grouped);
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
    if (!diary) return res.status(404).json({ message: "일기를 찾을 수 없습니다." });

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
    if (!diary) return res.status(404).json({ message: "일기를 찾을 수 없습니다." });

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

// ✅ 자동 저장
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
        new: true,
        upsert: true,
      }
    );

    await updated.save();
    console.log("📝 [Auto-Save] 제목:", title, "| 내용:", content);
    currentStatus = "자동 저장됨";

    res.status(200).json({ message: "자동 저장 완료", diary: updated });
  } catch (err) {
    res.status(500).json({ message: "자동 저장 실패", error: err.message });
  }
};

// ✅ 임시 저장
exports.saveTemp = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user._id;
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

// ✅ 월별 일기 수 조회
exports.getDiaryCountByDate = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "year와 month는 필수입니다." });
    }

    const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
    const nextMonth = month === '12'
      ? `${parseInt(year) + 1}-01-01`
      : `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`;
    const endDate = new Date(new Date(nextMonth).getTime() - 1000);

    const counts = await Diary.aggregate([
      {
        $match: {
          date: { $gte: startDate.toISOString().slice(0, 10), $lte: endDate.toISOString().slice(0, 10) }
        }
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 }
        }
      }
    ]);

    const daysInMonth = new Date(year, parseInt(month), 0).getDate();
    const response = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const found = counts.find(c => c._id === dayStr);
      response[dayStr] = found ? found.count : 0;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// ✅ 전체 일기 수 조회
exports.getDiaryCount = async (req, res) => {
  try {
    const totalCount = await Diary.countDocuments({});
    res.json({ totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "총 일기 개수를 가져올 수 없습니다." });
  }
};

// ✅ 일기 상세 조회
exports.getDiaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const diary = await Diary.findById(id).populate("group", "name");

    if (!diary) {
      return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
    }

    res.status(200).json(diary);
  } catch (err) {
    console.error("❌ 일기 상세 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.getDiariesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const diaries = await Diary.find({ group: groupId })
      .populate("user", "name")       // 작성자 정보
      .sort({ date: -1 });            // 최신순

    res.status(200).json(diaries);
  } catch (err) {
    console.error("❌ 그룹별 일기 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};