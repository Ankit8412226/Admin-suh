const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");

router.post("/checkin", attendanceController.checkIn);
router.post("/halfday-checkin", attendanceController.halfDayCheckIn);
router.post("/checkout", attendanceController.checkOut);

module.exports = router;
