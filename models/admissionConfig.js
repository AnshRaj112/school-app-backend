const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const feeSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const admissionConfigSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, unique: true },
  isOpen: { type: Boolean, default: false },
  openFrom: { type: Date },
  openTill: { type: Date },
  fees: { type: [feeSchema], default: [] },
  formUrl: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

admissionConfigSchema.index({ school: 1 });

module.exports = Cluster_Operations.model("AdmissionConfig", admissionConfigSchema);


