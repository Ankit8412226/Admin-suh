const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
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
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("suh_attendance", attendanceSchema);
