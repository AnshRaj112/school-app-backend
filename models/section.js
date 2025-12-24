const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const sectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true, // A, B, C
    },

    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

module.exports = Cluster_Academics.model("Section", sectionSchema);
