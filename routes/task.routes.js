const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.post("/", verifyToken, taskController.createTask);
router.get("/", verifyToken, taskController.getAllTasks);
router.get("/:id", verifyToken, taskController.getTaskById);


router.put("/:id", verifyToken, authorizeRoles("team-lead"), taskController.updateTask);


router.delete("/:id", verifyToken, authorizeRoles("admin", "team-lead"), taskController.deleteTask);

module.exports = router;
