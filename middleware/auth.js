// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const Emp = require("../models/empSuh.model");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = await Emp.findById(decoded.id).select("-password"); // attach full user data
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token", error: error.message });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied. Unauthorized role." });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
