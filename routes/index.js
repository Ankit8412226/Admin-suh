const express = require("express");
const router = express.Router();

// Importing all route modules
const empRoutes = require("./emp.routes");
const attendanceRoutes = require("./attendance.routes");
const leaveRoutes = require("./leave.routes");
const leadRoutes = require("./lead.Routes");
const taskRoutes = require("./task.routes");


router.use("/employees", empRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/leads", leadRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
