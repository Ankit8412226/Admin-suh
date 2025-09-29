const express = require("express");
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getEmployeeLeads,
  getLeadById,
  updateLead,
  deleteLead,
  incrementReachCount,
  addActivity,
  getLeadStatistics
} = require("../controllers/lead.controller");
const { auth, authorize } = require("../middleware/auth");


// Create and get all leads
router.post("/", auth, authorize(["admin", "hr", "team-lead"]), createLead);
router.get("/", auth, getAllLeads);

// Get lead statistics
router.get("/statistics", auth, authorize(["admin", "hr", "team-lead"]), getLeadStatistics);

// Get leads assigned to a specific employee
router.get("/employee/:employeeId", auth, getEmployeeLeads);

// Get, update, delete specific lead
router.get("/:id", auth, getLeadById);
router.put("/:id", auth, authorize(["admin", "hr", "team-lead"]), updateLead);
router.delete("/:id", auth, authorize(["admin", "hr"]), deleteLead);

// Lead interactions
router.post("/:id/reach", auth, incrementReachCount);
router.post("/:id/activity", auth, addActivity);

module.exports = router;
