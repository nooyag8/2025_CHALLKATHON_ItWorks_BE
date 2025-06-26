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

    // ✅ 내가 속한 그룹 목록 불러오기 (비밀번호 포함)
    const myGroups = await Group.find({ members: userId }).select("_id name password");

    const myGroupIds = myGroups.map((g) => g._id);
    const groupPasswordMap = new Map(
      myGroups.map((g) => [g._id.toString(), !!g.password]) // ← 문자열 키로 저장
    );

    // ✅ 해당 날짜의 내가 속한 그룹의 일기들 조회
    const diaries = await Diary.find({
      date,
      group: { $in: myGroupIds },
    }).populate("group", "name");

    if (!diaries.length) {
      return res.status(404).json({ message: "해당 날짜에 일기가 없습니다." });
    }

    // ✅ 그룹별로 묶기
    const groupMap = new Map();
    diaries.forEach((diary) => {
      const groupId = diary.group?._id?.toString() || "etc";
      const groupName = diary.group?.name || "기타";
      const hasPassword = groupPasswordMap.get(groupId) || false; // ← 문자열 키 사용

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          id: groupId,
          groupName,
          hasPassword, // ✅ 프론트로 전달됨
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
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "인증된 사용자만 가능합니다." });
  }

  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const updated = await Diary.findOneAndUpdate(
      { user: userId, date: today, isTemp: true },
      {
        title,
        content,
        user: userId,
        date: today,
        isTemp: true,
        savedAt: now,
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("📝 [Auto-Save] 제목:", title, "| 내용:", content);
    currentStatus = "자동 저장됨";

    res.status(200).json({ message: "자동 저장 완료", diary: updated });
  } catch (err) {
    console.error("❌ 자동 저장 실패:", err);
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
  const { title, content, date, group, _id } = req.body;
  const userId = req.user?._id;

  console.log("🔍 전달된 데이터:", { title, content, date, group });
  console.log("📌 유저 ID:", userId);
  console.log("📷 업로드 파일:", req.file);

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let diary;

    if (_id) {
      diary = await Diary.findByIdAndUpdate(
        _id,
        { title, content, date, group, user: userId, imageUrl, isTemp: false },
        { new: true, runValidators: true }
      );
    } else {
      diary = new Diary({
        title,
        content,
        date,
        group,
        user: userId,
        imageUrl,
        isTemp: false,
      });
      await diary.save();
    }

    console.log("📥 [Create Diary] 저장 완료:", diary);
    currentStatus = "작성 완료됨";

    res.status(201).json({ message: "일기 생성 완료", diary });
  } catch (err) {
    console.error("❌ 저장 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// ✅ 월별 일기 수 조회
exports.getDiaryCountByDate = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({ message: "인증된 사용자만 접근 가능합니다." });
    }

    let { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "year와 month는 필수입니다." });
    }

    year = parseInt(year);
    month = parseInt(month);

    const paddedMonth = String(month).padStart(2, "0");
    const startDateStr = `${year}-${paddedMonth}-01`;
    const nextMonth =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    // 사용자의 그룹만 필터링
    const myGroups = await Group.find({ members: userId }).select("_id");
    const myGroupIds = myGroups.map((g) => g._id);

    const diaries = await Diary.find({
      group: { $in: myGroupIds },
      date: { $gte: startDateStr, $lt: nextMonth },
    }).select("date group readBy").lean();

    // 날짜별 초기 통계
    const statsMap = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${paddedMonth}-${String(day).padStart(2, "0")}`;
      statsMap[dayStr] = {
        totalCount: 0,
        unreadCount: 0,
        readCount: 0,
        groupsSet: new Set(),
      };
    }

    // 일기별 통계 처리
    diaries.forEach((diary) => {
      const dateStr = diary.date;
      const stat = statsMap[dateStr];
      if (!stat) return;

      stat.totalCount++;

      if (diary.readBy?.includes(userEmail)) {
        stat.readCount++;
      } else {
        stat.unreadCount++;
      }

      if (diary.group) {
        stat.groupsSet.add(diary.group.toString());
      }
    });

    // 최종 결과
    const result = {};
    Object.entries(statsMap).forEach(([date, stat]) => {
      result[date] = {
        totalCount: stat.totalCount,
        readCount: stat.readCount,
        unreadCount: stat.unreadCount,
        groupCount: stat.groupsSet.size,
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ 날짜별 일기 통계 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
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
  const { groupId } = req.params;
  const { date } = req.query;

  try {
    const query = { group: groupId };

    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().slice(0, 10);

      query.date = { $gte: date, $lt: nextDayStr };
    }

    const diaries = await Diary.find(query)
      .populate("user", "name email")
      .sort({ date: -1 });

    res.json(diaries);
  } catch (err) {
    console.error("❌ 그룹 일기 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// ✅ 그룹별 날짜별 일기 열람/미열람 통계
exports.getGroupDiaryCountByDate = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const { groupId } = req.params;
    let { year, month } = req.query;

    if (!userEmail || !groupId || !year || !month) {
      return res.status(400).json({ message: "필수 정보가 누락되었습니다." });
    }

    year = parseInt(year);
    month = parseInt(month);
    const paddedMonth = String(month).padStart(2, "0");

    const startDateStr = `${year}-${paddedMonth}-01`;
    const nextMonth =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const diaries = await Diary.find({
      group: groupId,
      date: { $gte: startDateStr, $lt: nextMonth },
    }).select("date readBy");

    const statsMap = {};

    for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
      const dateStr = `${year}-${paddedMonth}-${String(i).padStart(2, "0")}`;
      statsMap[dateStr] = {
        totalCount: 0,
        readCount: 0,
        unreadCount: 0,
      };
    }

    diaries.forEach((diary) => {
      const dateStr = diary.date;
      if (!statsMap[dateStr]) return;

      statsMap[dateStr].totalCount++;

      if (diary.readBy && diary.readBy.includes(userEmail)) {
        statsMap[dateStr].readCount++;
      } else {
        statsMap[dateStr].unreadCount++;
      }
    });

    res.status(200).json(statsMap);
  } catch (err) {
    console.error("❌ 그룹별 일기 통계 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.updateDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedDiary = await Diary.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }  // 수정된 결과 반환
    );

    if (!updatedDiary) return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });

    res.json(updatedDiary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Diary.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: '일기를 찾을 수 없습니다.' });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};