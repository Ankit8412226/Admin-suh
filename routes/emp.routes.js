const express = require("express");
const router = express.Router();

const empController = require("../controllers/emp.controller");

// Employee Auth
router.post("/register", empController.register);
router.post("/login", empController.login);
router.get("/" , empController.getAllEmployees)
router.get("/dasboard" , empController.getDashboardData)

module.exports = router;
