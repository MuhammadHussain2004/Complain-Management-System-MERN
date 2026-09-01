require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@scms.com").toLowerCase();
  const name = process.env.ADMIN_NAME || "Super Admin";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.status = "active";
    await existing.save();
    console.log(`Existing account "${email}" promoted to active admin.`);
  } else {
    await User.create({ name, email, password, role: "admin", status: "active" });
    console.log(`Initial admin account created: ${email}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to seed admin:", error.message);
  process.exit(1);
});
