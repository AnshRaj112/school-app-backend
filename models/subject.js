const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const subjectSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subjectSchema.index({ school: 1, code: 1 }, { unique: true });

module.exports = Cluster_Academics.model("Subject", subjectSchema);


