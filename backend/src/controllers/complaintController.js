const Complaint = require("../models/Complaint");

// POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      user: req.user._id,
      status: "Pending",
    });

    return res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit complaint", error: error.message });
  }
};

// GET /api/complaints/my
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

// GET /api/complaints/:id  (owner or admin)
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user", "name email");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const isOwner = complaint.user._id.equals(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaint", error: error.message });
  }
};

// PUT /api/complaints/:id  (owner only, while Pending)
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (!complaint.user.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own complaints" });
    }
    if (complaint.status !== "Pending") {
      return res.status(400).json({ message: "Only pending complaints can be edited" });
    }

    const { title, description, category, priority } = req.body;
    if (title !== undefined) complaint.title = title;
    if (description !== undefined) complaint.description = description;
    if (category !== undefined) complaint.category = category;
    if (priority !== undefined) complaint.priority = priority;

    await complaint.save();
    return res.status(200).json({ message: "Complaint updated", complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
};

// DELETE /api/complaints/:id  (owner only, while Pending)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (!complaint.user.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own complaints" });
    }
    if (complaint.status !== "Pending") {
      return res.status(400).json({ message: "Only pending complaints can be deleted" });
    }

    await complaint.deleteOne();
    return res.status(200).json({ message: "Complaint deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete complaint", error: error.message });
  }
};

// ---- Admin ----

// GET /api/complaints?status=&category=&priority=&search=
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

// PATCH /api/complaints/:id/status  { status, adminRemarks }
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    await complaint.save();
    return res.status(200).json({ message: "Complaint status updated", complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint status", error: error.message });
  }
};

// GET /api/complaints/stats
const getComplaintStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ status: "Rejected" }),
    ]);

    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCategory,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaint stats", error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats,
};
