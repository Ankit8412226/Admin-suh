const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const empController = require("../controllers/emp.controller");
const upload = require("../middleware/fileUpload");

// Public routes
router.post("/register", empController.register);
router.post("/login", empController.login);

// Protected routes
router.get("/", auth, empController.getAllEmployees);
router.get("/dashboard", auth, empController.getDashboardData);
router.get("/:id", auth, empController.getEmployeeById);
router.put("/:id/profile", auth, upload.single("profileImage"), empController.updateProfile);
router.put("/:id/status", auth, empController.updateEmployeeStatus);
router.put("/:id/password", auth, empController.changePassword);
router.delete("/:id", auth, empController.deleteEmployee);

module.exports = router;
