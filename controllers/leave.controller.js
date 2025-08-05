const Leave = require("../models/leave.model");

// Create a leave request
const applyLeave = async (req, res) => {
  try {
    const { employee, startDate, endDate, reason } = req.body;

    const leave = new Leave({
      employee,
      startDate,
      endDate,
      reason,
    });

    await leave.save();
    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit leave", error: error.message });
  }
};

// Get all leave requests (Admin View)
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaves", error: error.message });
  }
};

// Update leave status (Approve/Reject)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

module.exports = {
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
};
