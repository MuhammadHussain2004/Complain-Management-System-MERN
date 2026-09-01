const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "user",
      status: "pending",
    });

    return res.status(201).json({
      message: "Registration successful. Please wait for administrator approval before logging in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "pending") {
      return res.status(403).json({ message: "Your account is pending administrator approval" });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your account request was rejected. Contact the administrator." });
    }
    if (user.status === "deactivated") {
      return res.status(403).json({ message: "Your account has been deactivated. Contact the administrator." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isSuperAdmin: user.isSuperAdmin,
        promotedBy: user.promotedBy,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const getMe = async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
      promotedBy: user.promotedBy,
    },
  });
};

module.exports = { register, login, getMe };
