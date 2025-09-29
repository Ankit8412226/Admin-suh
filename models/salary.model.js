const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  basic: {
    type: Number,
    required: true,
  },
  hra: {
    type: Number,
    default: 0,
  },
  conveyanceAllowance: {
    type: Number,
    default: 0,
  },
  medicalAllowance: {
    type: Number,
    default: 0,
  },
  specialAllowance: {
    type: Number,
    default: 0,
  },
  professionalTax: {
    type: Number,
    default: 0,
  },
  tds: {
    type: Number,
    default: 0,
  },
  otherDeductions: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processed", "paid"],
    default: "pending",
  },
  paymentDate: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ["bank transfer", "cash", "cheque", "other"],
    default: "bank transfer",
  },
  remarks: {
    type: String,
  }
}, { timestamps: true });

// Create a compound index to ensure unique salary entries per employee per month/year
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("suh_salary", salarySchema);