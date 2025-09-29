const Emp = require("../models/empSuh.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const Task = require("../models/task.model");
const Lead = require("../models/lead.model");
const path = require("path");
const fs = require("fs");
const { sendWelcomeEmail } = require("../services/email");

const register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role, designation, department } = req.body;

    const existingEmp = await Emp.findOne({ email });
    if (existingEmp) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const plainPassword = password || Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate employee ID
    const empCount = await Emp.countDocuments();
    const employeeId = `SUH${(empCount + 1).toString().padStart(4, '0')}`;

    const newEmp = new Emp({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
      designation,
      department,
      employeeId,
      joiningDate: new Date()
    });

    await newEmp.save();

    // Send welcome email to the new employee with credentials
    try {
      await sendWelcomeEmail({
        name: newEmp.name,
        email: newEmp.email,
        position: newEmp.designation,
        startDate: newEmp.joiningDate,
        employeeId: newEmp.employeeId,
        department: newEmp.department,
        loginEmail: newEmp.email,
        tempPassword: plainPassword
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with the response even if email fails
    }

    res.status(201).json({
      message: "Employee registered successfully",
      employee: {
        id: newEmp._id,
        name: newEmp.name,
        email: newEmp.email,
        employeeId: newEmp.employeeId
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emp = await Emp.findOne({ email });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: emp._id, role: emp.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      emp: {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        employeeId: emp.employeeId,
        designation: emp.designation,
        department: emp.department,
        profileImage: emp.profileImage,
        status: emp.status,
        mobileNumber: emp.mobileNumber
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Emp.find().select("-password"); // Exclude password field
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await Emp.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ employee });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobileNumber, designation, department, status } = req.body;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingEmp = await Emp.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmp) {
        return res.status(400).json({ message: "Email already in use by another employee" });
      }
    }

    const updateData = {
      name,
      email,
      mobileNumber,
      designation,
      department,
      status
    };

    // Handle profile image if uploaded
    if (req.file) {
      // Delete old profile image if exists
      const employee = await Emp.findById(req.params.id);
      if (employee.profileImage) {
        const oldImagePath = path.join(__dirname, '..', employee.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new profile image path
      updateData.profileImage = '/uploads/' + req.file.filename;
    }

    const updatedEmployee = await Emp.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Available", "Not Available", "On Leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedEmployee = await Emp.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const employee = await Emp.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Emp.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete profile image if exists
    if (employee.profileImage) {
      const imagePath = path.join(__dirname, '..', employee.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Emp.findByIdAndDelete(req.params.id);

    // Delete related data (optional, can be modified based on requirements)
    await Attendance.deleteMany({ employee: req.params.id });
    await Leave.deleteMany({ employee: req.params.id });
    await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });
    await Lead.updateMany({ assignedTo: req.params.id }, { assignedTo: null });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Employee stats
    const totalEmployees = await Emp.countDocuments();
    const activeEmployees = await Emp.countDocuments({ status: "Available" });
    const onLeaveEmployees = await Emp.countDocuments({ status: "On Leave" });

    // Attendance stats
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "present"
    });

    const attendanceRate = totalEmployees > 0 ? (todayAttendance / totalEmployees) * 100 : 0;

    // Task stats
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "completed" });
    const pendingTasks = await Task.countDocuments({ status: { $ne: "completed" } });
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Lead stats
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: "new" });
    const convertedLeads = await Lead.countDocuments({ status: "converted" });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Leave stats
    const pendingLeaves = await Leave.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      data: {
      employeeStats: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        availabilityRate: totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0
      },
      attendanceStats: {
        today: todayAttendance,
        rate: attendanceRate.toFixed(2)
      },
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: taskCompletionRate.toFixed(2)
      },
      leadStats: {
        total: totalLeads,
        new: newLeads,
        converted: convertedLeads,
        conversionRate: conversionRate.toFixed(2)
      },
      leaveStats: {
        pending: pendingLeaves
      },
      lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getAllEmployees,
  getEmployeeById,
  updateProfile,
  updateEmployeeStatus,
  changePassword,
  deleteEmployee,
  getDashboardData
};
