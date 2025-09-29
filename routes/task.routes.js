const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { auth, authorize } = require("../middleware/auth");

// Create a new task
router.post("/", auth, taskController.createTask);

// Get all tasks with filtering and pagination
router.get("/", auth, taskController.getAllTasks);

// Get tasks for a specific employee
router.get("/employee/:employeeId", auth, taskController.getEmployeeTasks);

// Get task statistics
router.get("/statistics", auth, authorize("admin", "hr", "team-lead"), taskController.getTaskStatistics);

// Get a specific task by ID
router.get("/:id", auth, taskController.getTaskById);

// Update a task
router.put("/:id", auth, authorize("admin", "hr", "team-lead"), taskController.updateTask);

// Approve a task that is waiting for approval
router.put("/approve/:id", auth, authorize("admin", "hr", "team-lead"), taskController.approveTask);

// Add a comment to a task
router.post("/comment/:id", auth, taskController.addComment);

// Delete a task
router.delete("/:id", auth, authorize("admin", "hr", "team-lead"), taskController.deleteTask);

module.exports = router;
