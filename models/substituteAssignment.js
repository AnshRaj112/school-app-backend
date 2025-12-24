const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const substitutionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    teachingAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    absentTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    substituteTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    assignedById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

substitutionSchema.index(
  { teachingAssignmentId: 1, date: 1 },
  { unique: true }
);

module.exports = Cluster_Operations.model(
  "SubstitutionAssignment",
  substitutionSchema
);
