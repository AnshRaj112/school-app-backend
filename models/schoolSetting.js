const mongoose = require("mongoose");
const { Cluster_School } = require("../config/db");

const schoolSettingSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, unique: true },
  attendanceCutoffTime: { type: String, default: "18:00" },
  timezone: { type: String, default: "Asia/Kolkata" },
  gradingScale: { type: String, enum: ["percentage", "gpa"], default: "percentage" },
  academicYearStart: { type: Date },
  academicYearEnd: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schoolSettingSchema.index({ school: 1 });

module.exports = Cluster_School.model("SchoolSetting", schoolSettingSchema);


