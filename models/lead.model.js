const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["contact", "status_change", "assignment_change", "note", "meeting", "email", "call"],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee"
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  company: {
    type: String
  },
  source: {
    type: String,
    enum: ["direct", "referral", "website", "social_media", "event", "other"],
    default: "direct"
  },
  requirements: {
    type: String
  },
  budget: {
    type: Number
  },
  reachCount: {
    type: Number,
    default: 0,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
  },
  status: {
    type: String,
    enum: ["new", "contacted", "interested", "qualified", "proposal", "negotiation", "converted", "closed", "lost"],
    default: "new",
  },
  notes: String,
  lastContactDate: {
    type: Date
  },
  expectedClosingDate: {
    type: Date
  },
  value: {
    type: Number
  },
  activities: [activitySchema]
}, { timestamps: true });

module.exports = mongoose.model("suh_lead", leadSchema);
