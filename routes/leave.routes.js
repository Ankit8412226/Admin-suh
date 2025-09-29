
const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
console.log(leaveController);
const { auth, authorize } = require("../middleware/auth");

// Apply for leave - Any authenticated employee
router.post("/", auth, leaveController.applyLeave);

// Get all leaves - Admin/HR access
router.get("/", auth, authorize("admin", "hr"), leaveController.getAllLeaves);

// Get employee's own leaves
router.get("/employee/:employeeId", auth, leaveController.getEmployeeLeaves);

// Get leave statistics - Admin/HR access
router.get("/statistics", auth, authorize("admin", "hr"), leaveController.getLeaveStatistics);

// Update leave status - Admin/HR/Team Lead access
router.put(
  "/:id/status",
  auth,
  authorize("admin", "hr", "team-lead"),
  leaveController.updateLeaveStatus
);

// Add comment to leave request
router.post(
  "/comment/:id",
  auth,
  leaveController.addComment
);

// Delete leave request - Admin/HR access or employee's own request
router.delete(
  "/:id",
  auth,
  leaveController.deleteLeave
);

module.exports = router;
