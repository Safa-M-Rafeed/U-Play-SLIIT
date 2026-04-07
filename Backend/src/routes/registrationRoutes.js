import express from "express";
import Registration from "../models/Registration.js";
import Tournament from "../models/Tournament.js";
import Team from "../models/Team.js";
import authMiddleware from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// GET registrations for a tournament (Admin)
router.get('/tournament/:tournamentId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const registrations = await Registration.find({
      tournamentId: req.params.tournamentId
    }).populate('teamId');

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST register team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tournamentId, teamId } = req.body;

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

export default router;