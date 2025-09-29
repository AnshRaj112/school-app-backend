const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const breakdownSchema = new mongoose.Schema({
  componentCode: { type: String, required: true },
  label: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  discounts: { type: Number, default: 0, min: 0 },
  netAmount: { type: Number, required: true, min: 0 },
}, { _id: false });

const studentFeeSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  academicYearStart: { type: Date, required: true },
  academicYearEnd: { type: Date, required: true },
  feeRule: { type: mongoose.Schema.Types.ObjectId, ref: "FeeRule", required: true },
  version: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  breakdown: { type: [breakdownSchema], default: [] },
  totalAmount: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  netPayable: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

studentFeeSchema.index({ school: 1, student: 1, academicYearStart: 1 }, { unique: true });

module.exports = Cluster_Operations.model("StudentFee", studentFeeSchema);


