const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Cluster_Admin } = require("../config/db");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "moderator"],
    default: "admin",
  },
  permissions: {
    viewLocks: { type: Boolean, default: true },
    releaseLocks: { type: Boolean, default: true },
    clearAllLocks: { type: Boolean, default: false },
    viewStats: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false },
    manageVendors: { type: Boolean, default: false },
    systemSettings: { type: Boolean, default: false },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
      update.updatedAt = new Date();
      this.setUpdate(update);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

adminSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return await this.updateOne(updates);
};

adminSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

adminSchema.statics.findByCredentials = async function (email, password) {
  const admin = await this.findOne({ email, isActive: true });
  if (!admin) {
    throw new Error("Invalid login credentials");
  }
  if (admin.isLocked()) {
    throw new Error("Account is temporarily locked due to too many failed attempts");
  }
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await admin.incLoginAttempts();
    throw new Error("Invalid login credentials");
  }
  await admin.resetLoginAttempts();
  return admin;
};

adminSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

module.exports = Cluster_Admin.model("Admin", adminSchema);


