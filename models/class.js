const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, grade: 1 }, { unique: true });

module.exports = Cluster_Academics.model("Class", classSchema);
