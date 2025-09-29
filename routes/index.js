const express = require("express");
const router = express.Router();

// Importing all route modules
const empRoutes = require("./emp.routes");
const attendanceRoutes = require("./attendance.routes");
const leaveRoutes = require("./leave.routes");
const leadRoutes = require("./lead.routes");
const taskRoutes = require("./task.routes");
const salaryRoutes = require("./salary.routes");
const authRoutes = require("./auth.routes");

router.use("/auth", authRoutes);
router.use("/employees", empRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/leads", leadRoutes);
router.use("/tasks", taskRoutes);
router.use("/salaries", salaryRoutes);

module.exports = router;
