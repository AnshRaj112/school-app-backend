const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const markSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true, min: 1 },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  answerSheetUrl: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

markSchema.index({ school: 1, section: 1, subject: 1, student: 1, assignment: 1 }, { unique: true, partialFilterExpression: { assignment: { $type: "objectId" } } });

module.exports = Cluster_Academics.model("Mark", markSchema);


