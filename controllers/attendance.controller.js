const Attendance = require("../models/attendance.model");

module.exports = {
  checkIn: async (req, res) => {
    try {
      const { employeeId } = req.body;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Debug logging to see what time is being checked
      console.log(`Current time: ${currentHour}:${currentMinute}`);
      console.log(`Check condition: Hour=${currentHour}, Minute=${currentMinute}`);

      // FIXED: Allow check-in between 10:15 and 10:30 AM (inclusive)
      // The condition should reject if NOT in the allowed time window
      if (
        currentHour !== 10 ||
        currentMinute < 15 ||
        currentMinute > 30  // This is correct - we want to reject if minute is greater than 30
      ) {
        return res.status(400).json({
          message: `Full-day check-in allowed only between 10:15 and 10:30 AM. Current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
        });
      }

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
        status: "present",
      });

      await attendance.save();

      res.status(200).json({
        message: "Full-day check-in successful",
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
      const currentHour = now.getHours();

      // Debug logging
      console.log(`Half-day check-in attempt at hour: ${currentHour}`);

      if (currentHour < 11) {
        return res.status(400).json({
          message: `Half-day check-in allowed only after 11:00 AM. Current time: ${currentHour}:${now.getMinutes().toString().padStart(2, '0')}`,
        });
      }

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
