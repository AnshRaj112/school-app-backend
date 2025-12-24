const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const assignmentSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
    index: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
    index: true,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },

  type: {
    type: String,
    enum: ["classwork", "homework", "assignment"],
    required: true,
    index: true,
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },

  dueDate: { type: Date },

  maxMarks: { type: Number },
  isGraded: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
    index: true,
  },

  publishAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

assignmentSchema.index({ section: 1, subject: 1, createdAt: -1 });

assignmentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = Cluster_Academics.model("Assignment", assignmentSchema);
