const dns = require("dns");
const mongoose = require("mongoose");

// Node's built-in DNS resolver (c-ares) sometimes fails to reach the system's
// configured DNS server for the SRV lookup that `mongodb+srv://` needs, even
// though the OS resolver works fine (common on Windows). Pointing it at a
// public resolver avoids "querySrv ECONNREFUSED" on otherwise-working networks.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
