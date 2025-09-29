const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Employee model
const Employee = require('../models/empSuh.model');
const connectDB = require('../config/db');

// Connect to the database
connectDB();

// Function to seed the employee data
const seedEmployee = async () => {
  try {
    // Read admin password from .env
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('Error: ADMIN_PASSWORD not set in .env file');
      process.exit(1);
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: 'ankit.kumar@suhtech.com' });

    if (existingEmployee) {
      console.log('Employee Ankit Kumar already exists in the database');
      mongoose.connection.close();
      return;
    }

    // Create a default profile image path
    const defaultImagePath = path.join(__dirname, '../uploads/ankit_profile.jpg');

    // Make sure the image exists
    if (!fs.existsSync(defaultImagePath)) {
      console.warn('Warning: Default profile image not found at', defaultImagePath);
    }

    const imageFileName = 'ankit_profile.jpg';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the new employee
    const newEmployee = new Employee({
      name: 'Ankit Kumar',
      email: 'ankit.kumar@suhtech.com',
      mobileNumber: '9876543210',
      password: hashedPassword,
      role: 'team-lead',
      profileImage: `/uploads/${imageFileName}`,
      designation: 'CTO & Tech Lead',
      department: 'Technology',
      status: 'Available',
      joiningDate: new Date(),
    });

    // Save the employee to the database
    await newEmployee.save();

    console.log('Employee Ankit Kumar has been successfully added to the database');

    // Close the database connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding employee data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedEmployee();
