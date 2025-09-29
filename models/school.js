const mongoose = require("mongoose");
const { Cluster_School } = require("../config/db");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  pincode: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schoolSchema.index({ code: 1 });
schoolSchema.index({ name: 1 });

module.exports = Cluster_School.model("School", schoolSchema);


