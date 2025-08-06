const Emp = require("../models/empSuh.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmpSUH = require("../models/empSuh.model");
const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const Task = require("../models/task.model");
const Lead = require("../models/lead.model");

const register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role } = req.body;

    const existingEmp = await Emp.findOne({ email });
    if (existingEmp) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmp = new Emp({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
    });

    await newEmp.save();

    res.status(201).json({ message: "Employee registered successfully" });
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

    // === DASHBOARD STATS WITH TRENDS ===

    // Total Employees (current vs last month)
    const totalEmployees = await EmpSUH.countDocuments();
    const lastMonthEmployees = await EmpSUH.countDocuments({
      createdAt: { $lt: monthStart }
    });
    const employeesTrend = lastMonthEmployees > 0
      ? Math.round(((totalEmployees - lastMonthEmployees) / lastMonthEmployees) * 100)
      : 0;

    // Present Today vs Yesterday
    const presentToday = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "present"
    });

    const presentYesterday = await Attendance.countDocuments({
      date: { $gte: yesterday, $lt: today },
      status: "present"
    });

    const presentTrend = presentYesterday > 0
      ? Math.round(((presentToday - presentYesterday) / presentYesterday) * 100)
      : 0;

    // On Leave Today
    const onLeave = await Leave.countDocuments({
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Pending Tasks (current vs last week)
    const pendingTasks = await Task.countDocuments({
      status: { $in: ["pending", "in-progress", "waiting-for-approval"] }
    });

    const lastWeekPendingTasks = await Task.countDocuments({
      createdAt: { $gte: lastWeekStart, $lt: weekStart },
      status: { $in: ["pending", "in-progress", "waiting-for-approval"] }
    });

    const tasksTrend = lastWeekPendingTasks > 0
      ? Math.round(((pendingTasks - lastWeekPendingTasks) / lastWeekPendingTasks) * 100)
      : 0;

    // New Leads This Week vs Last Week
    const newLeadsThisWeek = await Lead.countDocuments({
      createdAt: { $gte: weekStart }
    });

    const newLeadsLastWeek = await Lead.countDocuments({
      createdAt: { $gte: lastWeekStart, $lt: weekStart }
    });

    const leadsTrend = newLeadsLastWeek > 0
      ? Math.round(((newLeadsThisWeek - newLeadsLastWeek) / newLeadsLastWeek) * 100)
      : 0;

    // Pending Leaves
    const pendingLeaves = await Leave.countDocuments({
      status: "pending"
    });

    // Attendance Rate Today
    const totalPossibleAttendance = totalEmployees - onLeave;
    const attendanceRate = totalPossibleAttendance > 0
      ? Math.round((presentToday / totalPossibleAttendance) * 100)
      : 0;

    // === RECENT ACTIVITIES (DYNAMIC) ===
    const recentActivities = [];

    // Recent Check-ins (last 3)
    const recentCheckIns = await Attendance.find({
      checkInTime: { $exists: true, $ne: null }
    })
    .populate('employee', 'name')
    .sort({ checkInTime: -1 })
    .limit(3);

    recentCheckIns.forEach(attendance => {
      if (attendance.employee) {
        recentActivities.push({
          id: `checkin_${attendance._id}`,
          type: 'attendance',
          message: `${attendance.employee.name} checked in`,
          time: formatTime(attendance.checkInTime),
          timestamp: attendance.checkInTime,
          icon: 'CheckCircle',
          color: 'text-green-500'
        });
      }
    });

    // Recent Check-outs (last 2)
    const recentCheckOuts = await Attendance.find({
      checkOutTime: { $exists: true, $ne: null }
    })
    .populate('employee', 'name')
    .sort({ checkOutTime: -1 })
    .limit(2);

    recentCheckOuts.forEach(attendance => {
      if (attendance.employee) {
        recentActivities.push({
          id: `checkout_${attendance._id}`,
          type: 'attendance',
          message: `${attendance.employee.name} checked out`,
          time: formatTime(attendance.checkOutTime),
          timestamp: attendance.checkOutTime,
          icon: 'CheckCircle',
          color: 'text-blue-500'
        });
      }
    });

    // Recent Leave Requests (last 3)
    const recentLeaveRequests = await Leave.find()
    .populate('employee', 'name')
    .sort({ createdAt: -1 })
    .limit(3);

    recentLeaveRequests.forEach(leave => {
      if (leave.employee) {
        const statusText = leave.status === 'pending' ? 'requested' : leave.status;
        recentActivities.push({
          id: `leave_${leave._id}`,
          type: 'leave',
          message: `${leave.employee.name} ${statusText} leave`,
          time: formatTime(leave.updatedAt),
          timestamp: leave.updatedAt,
          icon: 'Calendar',
          color: leave.status === 'approved' ? 'text-green-500' :
                 leave.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
        });
      }
    });

    // Recent Task Updates (last 3)
    const recentTaskUpdates = await Task.find()
    .populate('assignedTo', 'name')
    .sort({ updatedAt: -1 })
    .limit(3);

    recentTaskUpdates.forEach(task => {
      if (task.assignedTo) {
        const statusMessages = {
          'pending': 'assigned to',
          'in-progress': 'started working on',
          'completed': 'completed',
          'waiting-for-approval': 'submitted for approval'
        };

        const message = `${task.assignedTo.name} ${statusMessages[task.status] || 'updated'} "${task.title}"`;

        recentActivities.push({
          id: `task_${task._id}`,
          type: 'task',
          message: message,
          time: formatTime(task.updatedAt),
          timestamp: task.updatedAt,
          icon: 'CheckSquare',
          color: task.status === 'completed' ? 'text-green-500' : 'text-purple-500'
        });
      }
    });

    // Recent Lead Activities (last 3)
    const recentLeadActivities = await Lead.find()
    .populate('assignedTo', 'name')
    .sort({ updatedAt: -1 })
    .limit(3);

    recentLeadActivities.forEach(lead => {
      const isNewLead = new Date() - new Date(lead.createdAt) < 24 * 60 * 60 * 1000; // Within 24 hours

      if (isNewLead) {
        const assignedText = lead.assignedTo ? ` to ${lead.assignedTo.name}` : '';
        recentActivities.push({
          id: `newlead_${lead._id}`,
          type: 'lead',
          message: `New lead "${lead.name}" assigned${assignedText}`,
          time: formatTime(lead.createdAt),
          timestamp: lead.createdAt,
          icon: 'UserPlus',
          color: 'text-orange-500'
        });
      } else {
        const statusMessages = {
          'new': 'added',
          'contacted': 'was contacted',
          'interested': 'showed interest',
          'converted': 'was converted',
          'closed': 'was closed'
        };

        recentActivities.push({
          id: `leadupdate_${lead._id}`,
          type: 'lead',
          message: `Lead "${lead.name}" ${statusMessages[lead.status] || 'was updated'}`,
          time: formatTime(lead.updatedAt),
          timestamp: lead.updatedAt,
          icon: 'UserPlus',
          color: lead.status === 'converted' ? 'text-green-500' : 'text-orange-500'
        });
      }
    });

    // Sort all activities by timestamp and take top 5
    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map((activity, index) => {
        const { timestamp, ...activityData } = activity;
        return { ...activityData, id: index + 1 };
      });

    // === ADDITIONAL ANALYTICS ===

    // Lead Conversion Stats
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Task Completion Stats
    const completedTasksThisWeek = await Task.countDocuments({
      status: 'completed',
      updatedAt: { $gte: weekStart }
    });

    const completedTasksLastWeek = await Task.countDocuments({
      status: 'completed',
      updatedAt: { $gte: lastWeekStart, $lt: weekStart }
    });

    const taskCompletionTrend = completedTasksLastWeek > 0
      ? Math.round(((completedTasksThisWeek - completedTasksLastWeek) / completedTasksLastWeek) * 100)
      : 0;

    // Leave Analytics
    const approvedLeavesThisMonth = await Leave.countDocuments({
      status: 'approved',
      startDate: { $gte: monthStart }
    });

    // Performance Metrics
    const avgTasksPerEmployee = totalEmployees > 0 ? Math.round((await Task.countDocuments()) / totalEmployees) : 0;
    const avgLeadsPerEmployee = totalEmployees > 0 ? Math.round(totalLeads / totalEmployees) : 0;

    // === RESPONSE DATA ===
    const dashboardStats = {
      totalEmployees,
      presentToday,
      onLeave,
      pendingTasks,
      newLeads: newLeadsThisWeek,
      pendingLeaves,
      attendanceRate,
      conversionRate,
      completedTasksThisWeek,
      approvedLeavesThisMonth,
      avgTasksPerEmployee,
      avgLeadsPerEmployee
    };

    const trends = {
      totalEmployees: employeesTrend,
      presentToday: presentTrend,
      pendingTasks: tasksTrend,
      newLeads: leadsTrend,
      taskCompletion: taskCompletionTrend
    };

    res.status(200).json({
      success: true,
      data: {
        dashboardStats,
        trends,
        recentActivities: sortedActivities,
        analytics: {
          attendance: {
            rate: attendanceRate,
            present: presentToday,
            absent: totalEmployees - presentToday - onLeave,
            onLeave: onLeave
          },
          tasks: {
            pending: await Task.countDocuments({ status: 'pending' }),
            inProgress: await Task.countDocuments({ status: 'in-progress' }),
            completed: await Task.countDocuments({ status: 'completed' }),
            waitingApproval: await Task.countDocuments({ status: 'waiting-for-approval' })
          },
          leads: {
            new: await Lead.countDocuments({ status: 'new' }),
            contacted: await Lead.countDocuments({ status: 'contacted' }),
            interested: await Lead.countDocuments({ status: 'interested' }),
            converted: await Lead.countDocuments({ status: 'converted' }),
            closed: await Lead.countDocuments({ status: 'closed' })
          },
          leaves: {
            pending: pendingLeaves,
            approved: await Leave.countDocuments({ status: 'approved' }),
            rejected: await Leave.countDocuments({ status: 'rejected' })
          }
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Helper function to format time dynamically
const formatTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const targetDate = new Date(date);
  const diffInMinutes = Math.floor((now - targetDate) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
};

module.exports = {
  register,
  login,
  getAllEmployees ,
  getDashboardData,
};
