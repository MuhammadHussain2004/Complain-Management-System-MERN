const User = require("../models/User");
const Complaint = require("../models/Complaint");

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

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const unresolvedCount = await Complaint.countDocuments({
      user: user._id,
      status: { $nin: ["Resolved", "Rejected"] },
    });

    if (unresolvedCount > 0) {
      return res.status(400).json({
        message:
          "This user has complaint(s) that are not yet Resolved or Rejected. Update those complaints before deleting the account.",
      });
    }

    await Complaint.deleteMany({ user: user._id });
    await user.deleteOne();

    return res.status(200).json({ message: "User and their complaints deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  setUserStatus,
  setUserRole,
  deleteUser,
};
