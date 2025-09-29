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
    enum: ["admin", "hr", "emp", "team-lead"],
    default: "emp",
  },
  profileImage: {
    type: String,
    default: "",
  },
  designation: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Available", "Not Available", "On Leave"],
    default: "Available",
  },
  leaveCount: {
    type: Number,
    default: 0,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  employeeId: {
    type: String,
    unique: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("suh_employee", empSuhSchema);
