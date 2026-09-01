const express = require("express");
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats,
} = require("../controllers/complaintController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// User routes
router.post("/", createComplaint);
router.get("/my", getMyComplaints);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);

// Admin routes
router.get("/", adminOnly, getAllComplaints);
router.get("/stats", adminOnly, getComplaintStats);
router.patch("/:id/status", adminOnly, updateComplaintStatus);

// Shared (owner or admin) — kept after /my and /stats so those literal paths win
router.get("/:id", getComplaintById);

module.exports = router;
