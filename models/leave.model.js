const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
  },
  leaveType: {
    type: String,
    enum: ["sick", "casual", "annual", "other"],
    default: "casual"
  },
  comments: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("suh_leave", leaveSchema);
