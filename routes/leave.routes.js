
const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth");


router.post("/apply", verifyToken, leaveController.applyLeave);


router.get("/", verifyToken, leaveController.getAllLeaves);

// Only Admin or Team Lead can update leave status
router.put(
  "/status/:id",
  verifyToken,
  authorizeRoles("admin", "team-lead"),
  leaveController.updateLeaveStatus
);

module.exports = router;
