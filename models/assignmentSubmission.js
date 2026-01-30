const mongoose = require("mongoose");
const { Cluster_Academics } = require("../config/db");

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
    index: true,
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  submissionText: {
    type: String,
    trim: true,
  },

  attachments: [
    {
      url: { type: String, required: true },
      name: { type: String },
      fileType: { type: String, enum: ["file", "drive", "link"], default: "file" },
      fileSize: { type: Number },
    },
  ],

  status: {
    type: String,
    enum: ["submitted", "late", "resubmitted"],
    default: "submitted",
    index: true,
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  marksObtained: { type: Number },

  feedback: {
    type: String,
    trim: true,
  },

  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  gradedAt: { type: Date },

  updatedAt: { type: Date, default: Date.now },
});

/**
 * One submission per student per assignment
 */
assignmentSubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

assignmentSubmissionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = Cluster_Academics.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
