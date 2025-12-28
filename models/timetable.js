const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const TimetableSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "School",
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Section",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subject",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Teacher",
    },
    dayOfWeek: {
      type: Number, // 1 = Monday ... 7 = Sunday
      required: true,
      min: 1,
      max: 7,
    },
    startMinute: {
      type: Number, // 9:00 AM = 540
      required: true,
    },
    endMinute: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = Cluster_Academics.model("Timetable", TimetableSchema);
