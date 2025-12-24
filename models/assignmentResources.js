const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const assignmentResourceSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
    index: true
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },

  title: {
    type: String,
    trim: true
  },

  url: {
    type: String,
    required: true
  },

  resourceType: {
    type: String,
    enum: ["pdf", "image", "doc", "link", "video"],
    required: true,
    index: true
  },

  fileSize: { type: Number },

  isPrimary: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now }
});

assignmentResourceSchema.index({ assignment: 1, createdAt: 1 });

module.exports = Cluster_Academics.model(
  "AssignmentResource",
  assignmentResourceSchema
);


