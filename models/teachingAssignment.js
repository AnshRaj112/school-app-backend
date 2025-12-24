const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const teachingAssignmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true, // "2025-26"
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teachingAssignmentSchema.index(
  { sectionId: 1, subjectId: 1, academicYear: 1 },
  { unique: true }
);

module.exports = Cluster_Academics.model(
  "TeachingAssignment",
  teachingAssignmentSchema
);
