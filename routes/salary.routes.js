const express = require('express');
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const salaryController = require('../controllers/salary.controller');

// Create a new salary record - Admin/HR only
router.post('/', auth, authorize('admin', 'hr'), salaryController.createSalary);

// Get all salary records - Admin/HR only
router.get('/', auth, authorize('admin', 'hr'), salaryController.getAllSalaries);

// Get salary records for a specific employee
router.get('/employee/:employeeId', auth, salaryController.getEmployeeSalaries);

// Get a specific salary record
router.get('/:id', auth, salaryController.getSalaryById);

// Update a salary record - Admin/HR only
router.put('/:id', auth, authorize('admin', 'hr'), salaryController.updateSalary);

// Delete a salary record - Admin/HR only
router.delete('/:id', auth, authorize('admin', 'hr'), salaryController.deleteSalary);

// Generate salary report - Admin/HR only
router.get('/report/generate', auth, authorize('admin', 'hr'), salaryController.generateSalaryReport);

module.exports = router;
