const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();


app.use(cors({
  origin: ["http://localhost:5173", "https://emp-suh.vercel.app"],
  credentials: true,
}));


app.use(helmet());
app.use(compression());
app.use(express.json());


connectDB();


app.use("/api/v1", routes );

app.get("/health", (req, res) => {
  res.send("Welcome to SUH Employee Management API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
