const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmpSUH",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["present", "absent", "half-day", "on-leave"],
    default: "present",
  },
}, { timestamps: true });

module.exports = mongoose.model("Attendances", attendanceSchema);
