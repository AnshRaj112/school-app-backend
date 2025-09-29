const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Cluster_Principal, Cluster_School } = require("../config/db");

const principalSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"] },
  password: { type: String, required: true, minlength: 8 },
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  school: { type: mongoose.Schema.Types.ObjectId, ref: Cluster_School.modelNames().includes("School") ? Cluster_School.model("School").modelName : "School", required: true },
  permissions: {
    manageHolidays: { type: Boolean, default: true },
    manageTeachers: { type: Boolean, default: true },
    manageSections: { type: Boolean, default: true },
    manageSubjects: { type: Boolean, default: true },
    viewAttendance: { type: Boolean, default: true },
    viewMarks: { type: Boolean, default: true },
    manageAdmissions: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

principalSchema.index({ email: 1 });
principalSchema.index({ username: 1 });
principalSchema.index({ school: 1 });

principalSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (err) { next(err); }
});

principalSchema.pre("findOneAndUpdate", async function(next) {
  const update = this.getUpdate() || {};
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
      update.updatedAt = new Date();
      this.setUpdate(update);
    } catch (err) { return next(err); }
  }
  next();
});

module.exports = Cluster_Principal.model("Principal", principalSchema);


