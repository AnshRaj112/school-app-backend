const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const sectionSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  name: { type: String, required: true, trim: true },
  grade: { type: String, required: true, trim: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

sectionSchema.index({ school: 1, grade: 1, name: 1 }, { unique: true });

module.exports = Cluster_Academics.model("Section", sectionSchema);


