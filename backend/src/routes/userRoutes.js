const express = require("express");
const {
  getUsers,
  getUserById,
  approveUser,
  rejectUser,
  setUserStatus,
  setUserRole,
  updateUserName,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/approve", approveUser);
router.patch("/:id/reject", rejectUser);
router.patch("/:id/status", setUserStatus);
router.patch("/:id/role", setUserRole);
router.patch("/:id/name", updateUserName);
router.delete("/:id", deleteUser);

module.exports = router;
