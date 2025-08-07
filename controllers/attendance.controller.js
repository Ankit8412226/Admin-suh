const Attendance = require("../models/attendance.model");

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
        return res.status(400).json({ message: "Already checked in today." });
      }

      const attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkInTime: now,
        status: "present", // default to full-day unless frontend says otherwise
      });

      await attendance.save();

      res.status(200).json({
        message: "Check-in successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
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
        return res.status(400).json({ message: "Already checked in today." });
      }

      const attendance = new Attendance({
        employee: employeeId,
        date: today,
        checkInTime: now,
        status: "half-day",
      });

      await attendance.save();

      res.status(200).json({
        message: "Half-day check-in successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
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
        return res.status(404).json({ message: "Attendance not found." });
      }

      if (attendance.checkOutTime) {
        return res.status(400).json({ message: "Already checked out." });
      }

      attendance.checkOutTime = new Date();
      await attendance.save();

      res.status(200).json({
        message: "Check-out successful",
        data: attendance,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
