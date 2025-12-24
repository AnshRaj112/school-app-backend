const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Cluster_Teacher } = require("../config/db");

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    roles: {
      type: [String],
      enum: ["class_teacher", "subject_teacher", "substitute_teacher"],
      default: ["subject_teacher"],
    },

    teachableGrades: [
      {
        from: Number,
        to: Number,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = Cluster_Teacher.model("Teacher", teacherSchema);
