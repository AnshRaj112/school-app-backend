const mongoose = require("mongoose");
const { Cluster_Operations } = require("../config/db");

const holidaySchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, trim: true },
  isFullDay: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

holidaySchema.index({ school: 1, date: 1 }, { unique: true });

module.exports = Cluster_Operations.model("Holiday", holidaySchema);


