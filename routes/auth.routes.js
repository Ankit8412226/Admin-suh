const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateEmployeeRole
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Authentication routes
router.post("/register", auth, authorize(["admin", "hr"]), register);
router.post("/login", login);

// Profile routes (protected)
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);

// Admin routes
router.put("/update-role", auth, authorize(["admin"]), updateEmployeeRole);

module.exports = router;