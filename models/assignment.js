const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const assignmentSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ["classwork", "homework", "assignment"], required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  dueDate: { type: Date },
  attachments: [{ url: { type: String, trim: true }, name: { type: String, trim: true } }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

assignmentSchema.index({ school: 1, section: 1, subject: 1, type: 1, createdAt: -1 });

module.exports = Cluster_Academics.model("Assignment", assignmentSchema);


