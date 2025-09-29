const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { authorize } = require("../middleware/auth");
const attendanceController = require("../controllers/attendance.controller");

// Public routes for employees
router.post("/checkin", auth, attendanceController.checkIn);
router.post("/halfday-checkin", auth, attendanceController.halfDayCheckIn);
router.post("/checkout", auth, attendanceController.checkOut);

// Employee attendance history
router.get("/employee/:employeeId", auth, attendanceController.getEmployeeAttendance);

// Admin/HR routes
router.get("/", auth, authorize('admin', 'hr', 'team-lead'), attendanceController.getAllAttendance);
router.post("/mark-absent", auth, authorize('admin', 'hr', 'team-lead'), attendanceController.markAbsent);
router.put("/:id", auth, authorize('admin', 'hr'), attendanceController.updateAttendance);
router.delete("/:id", auth, authorize('admin', 'hr'), attendanceController.deleteAttendance);
router.get("/report", auth, authorize('admin', 'hr'), attendanceController.generateAttendanceReport);

module.exports = router;
