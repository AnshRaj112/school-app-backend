const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const attendanceSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent", "late", "excused", "half_day"], required: true },
  halfDayType: { type: String, enum: ["morning", "afternoon"], default: null },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  markedAt: { type: Date, default: Date.now },
  cutoffTime: { type: String },
  isLateEntry: { type: Boolean, default: false },
  notes: { type: String, trim: true },
});

attendanceSchema.index({ school: 1, section: 1, student: 1, date: 1 }, { unique: true });

module.exports = Cluster_Academics.model("Attendance", attendanceSchema);


