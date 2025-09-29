const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

// Versioned, principal-managed fee configuration per school and academic year
const feeComponentSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  frequency: { type: String, enum: ["one_time", "monthly", "quarterly", "yearly"], default: "yearly" },
  applicableGrades: [{ type: String, trim: true }],
  applicableSections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  isOptional: { type: Boolean, default: false },
}, { _id: false });

const feeRuleSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  academicYearStart: { type: Date, required: true },
  academicYearEnd: { type: Date, required: true },
  version: { type: Number, required: true },
  components: { type: [feeComponentSchema], default: [] },
  meta: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Principal", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

feeRuleSchema.index({ school: 1, academicYearStart: 1, version: 1 }, { unique: true });

module.exports = Cluster_Operations.model("FeeRule", feeRuleSchema);


