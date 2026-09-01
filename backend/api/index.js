require("dotenv").config();
const connectDB = require("../src/config/db");
const app = require("../src/app");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: error.message });
    return;
  }
  return app(req, res);
};
