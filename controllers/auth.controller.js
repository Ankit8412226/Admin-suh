const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Employee = require("../models/empSuh.model");

// Register a new employee
const register = async (req, res) => {
  try {
    const { name, email, password, role, designation, department, employeeId } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password"
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const employee = new Employee({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      designation,
      department,
      employeeId
    });

    await employee.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        designation: employee.designation,
        department: employee.department,
        employeeId: employee.employeeId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering employee",
      error: error.message
    });
  }
};

// Login employee
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        designation: employee.designation,
        department: employee.department,
        employeeId: employee.employeeId,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message
    });
  }
};

// Get current employee profile
const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

// Update employee profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, designation, department, phone, address } = req.body;
    
    // Find employee
    const employee = await Employee.findById(req.user.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    
    // Check if email is already taken by another employee
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use"
        });
      }
    }
    
    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (designation) employee.designation = designation;
    if (department) employee.department = department;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    
    await employee.save();
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        designation: employee.designation,
        department: employee.department,
        employeeId: employee.employeeId,
        phone: employee.phone,
        address: employee.address
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }
    
    // Find employee
    const employee = await Employee.findById(req.user.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt);
    
    await employee.save();
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message
    });
  }
};

// Admin: Update employee role
const updateEmployeeRole = async (req, res) => {
  try {
    const { employeeId, role } = req.body;
    
    // Check if required fields are provided
    if (!employeeId || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide employee ID and role"
      });
    }
    
    // Check if role is valid
    const validRoles = ["admin", "hr", "team-lead", "employee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be one of: admin, hr, team-lead, employee"
      });
    }
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    
    // Update role
    employee.role = role;
    await employee.save();
    
    res.status(200).json({
      success: true,
      message: "Employee role updated successfully",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating employee role",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateEmployeeRole
};