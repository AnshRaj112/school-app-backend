const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const leaveSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  applicantType: { type: String, enum: ["student", "teacher"], required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  appliedAt: { type: Date, default: Date.now },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Principal" },
  decidedAt: { type: Date },
  // Half-day support
  isHalfDay: { type: Boolean, default: false },
  halfDayType: { type: String, enum: ["morning", "afternoon"], default: null },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  verifiedAt: { type: Date },
});

leaveSchema.index({ school: 1, applicantType: 1, student: 1, teacher: 1, fromDate: 1, toDate: 1 });

module.exports = Cluster_Operations.model("Leave", leaveSchema);


