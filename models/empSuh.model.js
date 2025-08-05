const mongoose = require("mongoose");

const empSuhSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "emp", "team-lead"],
    default: "emp",
  },

  leaveCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("EmpSUH", empSuhSchema);
