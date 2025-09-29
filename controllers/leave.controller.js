const Leave = require("../models/leave.model");
const Employee = require("../models/empSuh.model");

// Create a leave request
const applyLeave = async (req, res) => {
  try {
    const { employee, startDate, endDate, reason, leaveType } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ 
        success: false,
        message: "Start date cannot be after end date" 
      });
    }

    // Calculate number of days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    // Check if employee has enough leave balance
    const employeeData = await Employee.findById(employee);
    if (!employeeData) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    if (employeeData.leaveCount < diffDays) {
      return res.status(400).json({ 
        success: false,
        message: "Insufficient leave balance" 
      });
    }

    const leave = new Leave({
      employee,
      startDate,
      endDate,
      reason,
      leaveType: leaveType || "casual",
      comments: []
    });

    await leave.save();
    
    res.status(201).json({ 
      success: true,
      message: "Leave request submitted successfully", 
      data: leave 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to submit leave request", 
      error: error.message 
    });
  }
};

// Get all leave requests (Admin/HR View)
const getAllLeaves = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } }
      ];
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: {
        path: 'employee',
        select: 'name email employeeId department designation'
      }
    };
    
    const leaves = await Leave.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('employee', 'name email employeeId department designation')
      .populate('approvedBy', 'name email employeeId');
    
    const total = await Leave.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leaves.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch leave requests", 
      error: error.message 
    });
  }
};

// Get leave requests for a specific employee
const getEmployeeLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query;
    
    let query = { employee: employeeId };
    
    if (status) {
      query.status = status;
    }
    
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name email');
    
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch employee leave requests", 
      error: error.message 
    });
  }
};

// Update leave status (Approve/Reject)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments, approvedBy } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status value" 
      });
    }

    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        message: "Leave request not found" 
      });
    }
    
    // Calculate leave days
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // If approving leave, update employee leave count and status
    if (status === "approved" && leave.status !== "approved") {
      const employee = await Employee.findById(leave.employee);
      
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: "Employee not found" 
        });
      }
      
      // Check if employee has enough leave balance
      if (employee.leaveCount < diffDays) {
        return res.status(400).json({ 
          success: false,
          message: "Employee has insufficient leave balance" 
        });
      }
      
      // Deduct leave count
      employee.leaveCount -= diffDays;
      
      // Update employee status for the leave period
      if (new Date() >= startDate && new Date() <= endDate) {
        employee.status = "On Leave";
      }
      
      await employee.save();
    }
    
    // If rejecting a previously approved leave, restore leave count
    if (status === "rejected" && leave.status === "approved") {
      const employee = await Employee.findById(leave.employee);
      
      if (employee) {
        employee.leaveCount += diffDays;
        
        // Reset status if currently on leave
        if (employee.status === "On Leave") {
          employee.status = "Available";
        }
        
        await employee.save();
      }
    }
    
    // Add comment if provided
    if (comments) {
      leave.comments.push({
        text: comments,
        author: approvedBy
      });
    }
    
    leave.status = status;
    leave.approvedBy = approvedBy;
    
    await leave.save();

    res.status(200).json({ 
      success: true,
      message: `Leave request ${status}`, 
      data: leave 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to update leave status", 
      error: error.message 
    });
  }
};

// Delete a leave request
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        message: "Leave request not found" 
      });
    }
    
    // If leave was approved, restore leave count
    if (leave.status === "approved") {
      const employee = await Employee.findById(leave.employee);
      
      if (employee) {
        // Calculate leave days
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        employee.leaveCount += diffDays;
        
        // Reset status if currently on leave
        if (employee.status === "On Leave") {
          employee.status = "Available";
        }
        
        await employee.save();
      }
    }
    
    await Leave.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true,
      message: "Leave request deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to delete leave request", 
      error: error.message 
    });
  }
};

// Add comment to a leave request
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: "Comment text is required" 
      });
    }
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        message: "Leave request not found" 
      });
    }
    
    leave.comments.push({
      text,
      author
    });
    
    await leave.save();
    
    res.status(200).json({ 
      success: true,
      message: "Comment added successfully", 
      data: leave 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to add comment", 
      error: error.message 
    });
  }
};

// Get leave statistics
const getLeaveStatistics = async (req, res) => {
  try {
    const { year, month, department } = req.query;
    
    let dateFilter = {};
    let employeeFilter = {};
    
    // Filter by date
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } }
        ]
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } }
        ]
      };
    }
    
    // Filter by department
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      const employeeIds = employees.map(emp => emp._id);
      
      employeeFilter = { employee: { $in: employeeIds } };
    }
    
    // Combine filters
    const filter = { ...dateFilter, ...employeeFilter };
    
    // Get leave statistics
    const totalLeaves = await Leave.countDocuments(filter);
    const approvedLeaves = await Leave.countDocuments({ ...filter, status: "approved" });
    const pendingLeaves = await Leave.countDocuments({ ...filter, status: "pending" });
    const rejectedLeaves = await Leave.countDocuments({ ...filter, status: "rejected" });
    
    // Get leave type statistics
    const leaveTypes = await Leave.aggregate([
      { $match: { ...filter, status: "approved" } },
      { $group: { _id: "$leaveType", count: { $sum: 1 } } }
    ]);
    
    // Format leave types
    const leaveTypeStats = {};
    leaveTypes.forEach(type => {
      leaveTypeStats[type._id || 'other'] = type.count;
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalLeaves,
        approved: approvedLeaves,
        pending: pendingLeaves,
        rejected: rejectedLeaves,
        leaveTypes: leaveTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch leave statistics", 
      error: error.message 
    });
  }
};

module.exports = {
  applyLeave,
  getAllLeaves,
  getEmployeeLeaves,
  updateLeaveStatus,
  deleteLeave,
  addComment,
  getLeaveStatistics
};
