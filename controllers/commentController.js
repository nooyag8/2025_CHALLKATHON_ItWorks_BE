// controllers/commentController.js
const Comment = require("../js/Comment");
const Diary = require("../js/diary");  

exports.getComments = async (req, res) => {
  const { diaryId } = req.params;
  try {
    const diary = await Diary.findById(diaryId).populate("comments.author", "name");
    if (!diary) return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
    res.status(200).json(diary.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

exports.addComment = async (req, res) => {
  const { diaryId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
  }

  try {
    const diary = await Diary.findById(diaryId);
    if (!diary) return res.status(404).json({ message: "일기를 찾을 수 없습니다." });

    diary.comments.push({ author: userId, content: content.trim() });
    await diary.save();

    res.status(201).json({ message: "댓글이 저장되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};
