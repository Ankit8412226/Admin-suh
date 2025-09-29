const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
    required: true,
  },
  
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suh_employee",
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "waiting-for-approval"],
    default: "pending",
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },

  dueDate: Date,
  
  completionDate: Date,
  
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "suh_employee"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("suh_task", taskSchema);
