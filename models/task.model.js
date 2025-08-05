const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmpSUH",
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "waiting-for-approval"],
    default: "pending",
  },

  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
