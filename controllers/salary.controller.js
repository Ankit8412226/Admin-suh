const Salary = require('../models/salary.model');
const Employee = require('../models/empSuh.model');

// Create a new salary record
exports.createSalary = async (req, res) => {
  try {
    const {
      employee,
      month,
      year,
      basic,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      professionalTax,
      tds,
      otherDeductions,
      paymentMethod,
      remarks
    } = req.body;

    // Check if employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if salary for this employee and month/year already exists
    const existingSalary = await Salary.findOne({
      employee,
      month,
      year
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: 'Salary record already exists for this employee in the specified month and year'
      });
    }

    // Calculate totals
    const totalEarnings = Number(basic || 0) + 
                         Number(hra || 0) + 
                         Number(conveyanceAllowance || 0) + 
                         Number(medicalAllowance || 0) + 
                         Number(specialAllowance || 0);
                         
    const totalDeductions = Number(professionalTax || 0) + 
                           Number(tds || 0) + 
                           Number(otherDeductions || 0);
                           
    const netSalary = totalEarnings - totalDeductions;

    // Create new salary record
    const salary = new Salary({
      employee,
      month,
      year,
      basic,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      professionalTax,
      tds,
      otherDeductions,
      totalEarnings,
      totalDeductions,
      netSalary,
      status: 'pending',
      paymentMethod,
      remarks
    });

    await salary.save();

    res.status(201).json({
      success: true,
      message: 'Salary record created successfully',
      data: salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating salary record',
      error: error.message
    });
  }
};

// Get all salary records
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'name email employeeId designation department')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching salary records',
      error: error.message
    });
  }
};

// Get salary records for a specific employee
exports.getEmployeeSalaries = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salaries = await Salary.find({ employee: employeeId })
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee salary records',
      error: error.message
    });
  }
};

// Get a specific salary record
exports.getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findById(id)
      .populate('employee', 'name email employeeId designation department');

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching salary record',
      error: error.message
    });
  }
};

// Update a salary record
exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      basic,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      professionalTax,
      tds,
      otherDeductions,
      status,
      paymentDate,
      paymentMethod,
      remarks
    } = req.body;

    // Find the salary record
    const salary = await Salary.findById(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    // Calculate totals
    const totalEarnings = Number(basic || salary.basic || 0) + 
                         Number(hra || salary.hra || 0) + 
                         Number(conveyanceAllowance || salary.conveyanceAllowance || 0) + 
                         Number(medicalAllowance || salary.medicalAllowance || 0) + 
                         Number(specialAllowance || salary.specialAllowance || 0);
                         
    const totalDeductions = Number(professionalTax || salary.professionalTax || 0) + 
                           Number(tds || salary.tds || 0) + 
                           Number(otherDeductions || salary.otherDeductions || 0);
                           
    const netSalary = totalEarnings - totalDeductions;

    // Update salary record
    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      {
        basic: basic || salary.basic,
        hra: hra || salary.hra,
        conveyanceAllowance: conveyanceAllowance || salary.conveyanceAllowance,
        medicalAllowance: medicalAllowance || salary.medicalAllowance,
        specialAllowance: specialAllowance || salary.specialAllowance,
        professionalTax: professionalTax || salary.professionalTax,
        tds: tds || salary.tds,
        otherDeductions: otherDeductions || salary.otherDeductions,
        totalEarnings,
        totalDeductions,
        netSalary,
        status: status || salary.status,
        paymentDate: paymentDate || salary.paymentDate,
        paymentMethod: paymentMethod || salary.paymentMethod,
        remarks: remarks || salary.remarks
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Salary record updated successfully',
      data: updatedSalary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating salary record',
      error: error.message
    });
  }
};

// Delete a salary record
exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByIdAndDelete(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Salary record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting salary record',
      error: error.message
    });
  }
};

// Generate salary report
exports.generateSalaryReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = {};
    
    if (month) query.month = month;
    if (year) query.year = year;
    
    const salaries = await Salary.find(query)
      .populate('employee', 'name email employeeId designation department')
      .sort({ employee: 1 });
      
    // Calculate summary statistics
    const totalSalaryPaid = salaries.reduce((sum, salary) => sum + (salary.status === 'paid' ? salary.netSalary : 0), 0);
    const totalSalaryPending = salaries.reduce((sum, salary) => sum + (salary.status === 'pending' ? salary.netSalary : 0), 0);
    const totalEmployees = new Set(salaries.map(s => s.employee._id.toString())).size;
    
    res.status(200).json({
      success: true,
      count: salaries.length,
      summary: {
        totalSalaryPaid,
        totalSalaryPending,
        totalEmployees,
        averageSalary: salaries.length > 0 ? (totalSalaryPaid + totalSalaryPending) / totalEmployees : 0
      },
      data: salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating salary report',
      error: error.message
    });
  }
};