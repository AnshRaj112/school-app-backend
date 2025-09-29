const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const substituteSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  date: { type: Date, required: true },
  absentTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  substituteTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Principal", required: true },
  createdAt: { type: Date, default: Date.now },
});

substituteSchema.index({ school: 1, section: 1, subject: 1, date: 1 }, { unique: true });

module.exports = Cluster_Operations.model("SubstituteTeacher", substituteSchema);


