const Emp = require("../models/empSuh.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role } = req.body;

    const existingEmp = await Emp.findOne({ email });
    if (existingEmp) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmp = new Emp({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
    });

    await newEmp.save();

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emp = await Emp.findOne({ email });
    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: emp._id, role: emp.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      emp: {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Emp.find().select("-password"); // Exclude password field
    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};
module.exports = {
  register,
  login,
  getAllEmployees ,
};
