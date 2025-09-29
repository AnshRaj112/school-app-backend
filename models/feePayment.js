const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const feePaymentSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  studentFee: { type: mongoose.Schema.Types.ObjectId, ref: "StudentFee", required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["cash", "card", "bank_transfer", "upi", "cheque"], required: true },
  reference: { type: String, trim: true },
  receivedAt: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
}, { timestamps: true });

feePaymentSchema.index({ school: 1, student: 1, receivedAt: -1 });

module.exports = Cluster_Operations.model("FeePayment", feePaymentSchema);


