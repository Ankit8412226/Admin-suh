const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes");
const { testEmailConnection, sendWelcomeEmail } = require("./services/email");

require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://emp-suh.vercel.app",
    "https://www.suhtech.store",
    "https://suhtech.store"
  ],
  credentials: true,
}));

app.use(helmet());
app.use(compression());
app.use(express.json());

// Initialize database connection
connectDB();

// Initialize email service on startup
async function initializeServices() {
  console.log('🔧 Initializing services...');
  try {
    const emailTest = await testEmailConnection();
    if (emailTest) {
      console.log('✅ Email service initialized successfully');
    } else {
      console.log('⚠️ Email service failed to initialize - check configuration');
    }
  } catch (error) {
    console.log('❌ Email service initialization error:', error.message);
  }
}

// Routes
app.use("/api/v1", routes);

// ✅ Correctly define email send route using `app.post`
app.post("/api/v1/email/send", async (req, res) => {

  try {
    const employeeData = {
      name: "Sahil",
      email: "sahilvr66@gmail.com",
      position: "game Devloper",
      department: "IT",
      startDate: "September 15, 2025",
      employeeId: "ST0004",
    };

    const result = await sendWelcomeEmail(employeeData); // no arguments passed
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      info: result,
    });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Welcome to SUH Employee Management API",
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      email: "Available"
    }
  });
});

// Email service health check
app.get("/api/v1/email/health", async (req, res) => {
  try {
    const emailTest = await testEmailConnection();
    if (emailTest) {
      res.json({
        success: true,
        message: "Email service is working properly"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Email service connection failed"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing email service",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeServices();
});
