const User = require("../models/User");

// GET /api/admin/users?status=pending&role=user&search=john
const getUsers = async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// PATCH /api/admin/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status !== "pending") {
      return res.status(400).json({ message: "Only pending accounts can be approved" });
    }
    user.status = "active";
    await user.save();
    return res.status(200).json({ message: "User approved", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve user", error: error.message });
  }
};

// PATCH /api/admin/users/:id/reject
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status !== "pending") {
      return res.status(400).json({ message: "Only pending accounts can be rejected" });
    }
    user.status = "rejected";
    await user.save();
    return res.status(200).json({ message: "User rejected", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject user", error: error.message });
  }
};

// PATCH /api/admin/users/:id/status  { status: "active" | "deactivated" }
const setUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "deactivated"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'active' or 'deactivated'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot change your own account status" });
    }

    user.status = status;
    await user.save();
    return res.status(200).json({ message: `User ${status}`, user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// PATCH /api/admin/users/:id/role  { role: "user" | "admin" }
const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    user.role = role;
    await user.save();
    return res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  setUserStatus,
  setUserRole,
};
