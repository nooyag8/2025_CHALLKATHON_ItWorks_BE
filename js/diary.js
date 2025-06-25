const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const diarySchema = new Schema({
  title: String,
  content: String,
  date: String,
  group: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: String,
  readBy: [String],
  isTemp: { type: Boolean, default: false },
});

module.exports = mongoose.model("Diary", diarySchema);
