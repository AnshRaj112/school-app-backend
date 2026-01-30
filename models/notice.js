const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const noticeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "postedByType",
    required: true,
  },
  postedByType: {
    type: String,
    enum: ["Teacher", "Principal", "Admin"],
    required: true,
  },
  postedByName: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["normal", "high", "urgent"],
    default: "normal",
    index: true,
  },
  targetAudience: {
    type: String,
    enum: ["all", "section", "class", "subject"],
    default: "all",
  },
  targetSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  },
  targetClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  targetSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

noticeSchema.index({ school: 1, isActive: 1, createdAt: -1 });
noticeSchema.index({ school: 1, targetSection: 1, isActive: 1 });

noticeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = Cluster_Operations.model("Notice", noticeSchema);

