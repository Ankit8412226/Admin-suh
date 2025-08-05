const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: String,
  source: String,


  projectName: {
    type: String,
    required: true,
  },
  projectDescription: {
    type: String,
  },


  reachCount: {
    type: Number,
    default: 0,
  },


  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmpSUH",
  },


  status: {
    type: String,
    enum: ["new", "contacted", "interested", "converted", "closed"],
    default: "new",
  },

  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
