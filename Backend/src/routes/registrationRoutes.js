import express from "express";
import Registration from "../models/Registration.js";
import Tournament from "../models/Tournament.js";
import Team from "../models/Team.js";
import authMiddleware from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

/**
 * @route   POST /api/registrations
 * @desc    Register a team for a tournament
 * @access  Private (Captain)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tournamentId, teamId } = req.body;

    // Check if already registered
    const existing = await Registration.findOne({ tournamentId, teamId });
    if (existing) {
      return res.status(400).json({ message: "Team already registered for this tournament" });
    }

    const registration = await Registration.create({
      tournamentId,
      teamId,
      captainId: req.user._id,
    });

    res.status(201).json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/registrations/tournament/:tournamentId
 * @desc    Get all registrations for a tournament
 * @access  Private (Admin)
 */
router.get(
  "/tournament/:tournamentId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const registrations = await Registration.find({
        tournamentId: req.params.tournamentId,
      })
        .populate("teamId")
        .populate("captainId", "name email");

      res.json({ success: true, registrations });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route   GET /api/registrations/captain
 * @desc    Get logged-in captain's registrations
 * @access  Private
 */
router.get("/captain", authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({
      captainId: req.user._id,
    }).populate("tournamentId");

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   PUT /api/registrations/:id/approve
 * @desc    Approve a registration
 * @access  Private (Admin)
 */
router.put("/:id/approve", authMiddleware, adminOnly, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   PUT /api/registrations/:id/reject
 * @desc    Reject a registration
 * @access  Private (Admin)
 */
router.put("/:id/reject", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        rejectionReason: reason || "Not specified",
      },
      { new: true }
    );

    res.json({ success: true, registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;