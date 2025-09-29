const Attendance = require("../models/attendance.model");
const Employee = require("../models/empSuh.model");
const mongoose = require("mongoose");

module.exports = {
  checkIn: async (req, res) => {
    try {
      const { employeeId } = req.body;

      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

      if (existing) {
        return res.status(400).json({ 
          success: false,
          message: "Already checked in today." 
        });
      }

      const attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkInTime: now,
        status: "present", // default to full-day unless frontend says otherwise
        notes: req.body.notes || ""
      });

      await attendance.save();

      // Update employee status to Available
      await Employee.findByIdAndUpdate(employeeId, { status: "Available" });

      res.status(200).json({
        success: true,
        message: "Check-in successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: err.message
      });
    }
  },

  halfDayCheckIn: async (req, res) => {
    try {
      const { employeeId } = req.body;

      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

      if (existing) {
        return res.status(400).json({ 
          success: false,
          message: "Already checked in today." 
        });
      }

      const attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkInTime: now,
        status: "half-day",
        notes: req.body.notes || "Half day"
      });

      await attendance.save();

      // Update employee status to Available
      await Employee.findByIdAndUpdate(employeeId, { status: "Available" });

      res.status(200).json({
        success: true,
        message: "Half-day check-in successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: err.message
      });
    }
  },

  checkOut: async (req, res) => {
    try {
      const { employeeId } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: today,
      });

      if (!attendance) {
        return res.status(404).json({ 
          success: false,
          message: "Attendance not found." 
        });
      }

      if (attendance.checkOutTime) {
        return res.status(400).json({ 
          success: false,
          message: "Already checked out." 
        });
      }

      attendance.checkOutTime = new Date();
      attendance.notes = req.body.notes || attendance.notes;
      await attendance.save();

      // Update employee status to Not Available after checkout
      await Employee.findByIdAndUpdate(employeeId, { status: "Not Available" });

      res.status(200).json({
        success: true,
        message: "Check-out successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: err.message
      });
    }
  },

  // Get attendance for a specific employee
  getEmployeeAttendance: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      let query = { employee: employeeId };

      // Filter by month and year if provided
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        query.date = { $gte: startDate, $lte: endDate };
      }

      const attendance = await Attendance.find(query)
        .sort({ date: -1 })
        .populate('employee', 'name email employeeId');

      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: "Error fetching attendance records",
        error: err.message
      });
    }
  },

  // Get all attendance records with pagination and filtering
  getAllAttendance: async (req, res) => {
    try {
      const { page = 1, limit = 10, startDate, endDate, status } = req.query;
      
      let query = {};
      
      // Date range filter
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Status filter
      if (status) {
        query.status = status;
      }
      
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { date: -1 },
        populate: {
          path: 'employee',
          select: 'name email employeeId department designation'
        }
      };
      
      const attendance = await Attendance.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ date: -1 })
        .populate('employee', 'name email employeeId department designation');
      
      const total = await Attendance.countDocuments(query);
      
      res.status(200).json({
        success: true,
        count: attendance.length,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: attendance
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        success: false,
        message: "Error fetching attendance records",
        error: err.message
      });
    }
  },

  // Mark employee as absent
  markAbsent: async (req, res) => {
    try {
      const { employeeId, date, reason } = req.body;
      
      const absentDate = date ? new Date(date) : new Date();
      absentDate.setHours(0, 0, 0, 0);
      
      const existing = await Attendance.findOne({
        employee: employeeId,
        date: absentDate
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Attendance record already exists for this date"
        });
      }
      
      const attendance = new Attendance({
        employee: employeeId,
        date: absentDate,
        status: "absent",
        notes: reason || "Marked absent"
      });
      
      await attendance.save();
      
      res.status(200).json({
        success: true,
        message: "Employee marked as absent",
        data: attendance
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error marking employee as absent",
        error: err.message
      });
    }
  },

  // Update attendance record
  updateAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, checkInTime, checkOutTime, notes } = req.body;
      
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found"
        });
      }
      
      if (status) attendance.status = status;
      if (checkInTime) attendance.checkInTime = new Date(checkInTime);
      if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
      if (notes) attendance.notes = notes;
      
      await attendance.save();
      
      res.status(200).json({
        success: true,
        message: "Attendance record updated successfully",
        data: attendance
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error updating attendance record",
        error: err.message
      });
    }
  },

  // Delete attendance record
  deleteAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      
      const attendance = await Attendance.findByIdAndDelete(id);
      
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Attendance record deleted successfully"
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error deleting attendance record",
        error: err.message
      });
    }
  },

  // Generate attendance report
  generateAttendanceReport: async (req, res) => {
    try {
      const { month, year, department } = req.query;
      
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "Month and year are required for generating report"
        });
      }
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      let employeeQuery = {};
      if (department) {
        employeeQuery.department = department;
      }
      
      // Get all employees
      const employees = await Employee.find(employeeQuery).select('_id name employeeId department designation');
      
      // Get attendance for the month
      const attendanceRecords = await Attendance.find({
        date: { $gte: startDate, $lte: endDate }
      });
      
      // Calculate statistics for each employee
      const report = employees.map(employee => {
        const employeeAttendance = attendanceRecords.filter(
          record => record.employee.toString() === employee._id.toString()
        );
        
        const presentDays = employeeAttendance.filter(record => record.status === 'present').length;
        const halfDays = employeeAttendance.filter(record => record.status === 'half-day').length;
        const absentDays = employeeAttendance.filter(record => record.status === 'absent').length;
        const leaveDays = employeeAttendance.filter(record => record.status === 'on-leave').length;
        
        // Calculate working days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        return {
          employee: {
            _id: employee._id,
            name: employee.name,
            employeeId: employee.employeeId,
            department: employee.department,
            designation: employee.designation
          },
          statistics: {
            presentDays,
            halfDays,
            absentDays,
            leaveDays,
            totalWorkingDays: daysInMonth,
            attendancePercentage: ((presentDays + (halfDays * 0.5)) / daysInMonth * 100).toFixed(2)
          }
        };
      });
      
      res.status(200).json({
        success: true,
        month,
        year,
        department: department || 'All',
        report
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error generating attendance report",
        error: err.message
      });
    }
  }
};
