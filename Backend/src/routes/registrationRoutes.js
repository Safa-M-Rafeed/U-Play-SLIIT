const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

/**
 * @route   GET /api/registrations/tournament/:tournamentId
 * @desc    Get all registrations for a tournament
 * @access  Private (Admin only)
 */
router.get('/tournament/:tournamentId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { tournamentId: req.params.tournamentId };
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    const registrations = await Registration.find(query)
      .populate({
        path: 'teamId',
        select: 'name logo sport players',
        populate: {
          path: 'captain',
          select: 'username email'
        }
      })
      .populate('captainId', 'username email phoneNumber')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      registrations,
      count: registrations.length
    });
    
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/registrations/my-registrations
 * @desc    Get current user's team registrations
 * @access  Private (Captain)
 */
router.get('/my-registrations', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({
      captainId: req.user._id
    })
      .populate('tournamentId', 'name sport startDate endDate status')
      .populate('teamId', 'name logo')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      registrations,
      count: registrations.length
    });
    
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/registrations
 * @desc    Register team for tournament
 * @access  Private (Captain only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tournamentId, teamId } = req.body;
    
    // Validate required fields
    if (!tournamentId || !teamId) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide tournament and team' 
      });
    }
    
    // Validate tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ 
        success: false,
        message: 'Tournament not found' 
      });
    }
    
    // Validate team exists
    const team = await Team.findById(teamId).populate('captain', 'username');
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }
    
    // Check if user is the team captain
    if (team.captain._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Only team captain can register the team' 
      });
    }
    
    // Check if tournament is accepting registrations
    if (tournament.status !== 'Upcoming') {
      return res.status(400).json({ 
        success: false,
        message: 'Tournament is not accepting registrations' 
      });
    }
    
    // Check registration deadline
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return res.status(400).json({ 
        success: false,
        message: 'Registration deadline has passed' 
      });
    }
    
    // Check if tournament is full
    if (tournament.registeredTeams >= tournament.maxTeams) {
      return res.status(400).json({ 
        success: false,
        message: 'Tournament is full' 
      });
    }
    
    // Check if team's sport matches tournament sport
    if (team.sport !== tournament.sport) {
      return res.status(400).json({ 
        success: false,
        message: `This is a ${tournament.sport} tournament. Your team is registered for ${team.sport}` 
      });
    }
    
    // Check if team already registered
    const existingRegistration = await Registration.findOne({
      tournamentId,
      teamId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        message: `Team already registered with status: ${existingRegistration.status}` 
      });
    }
    
    // Check minimum players requirement (example: 11 for football, 5 for basketball)
    const minPlayers = {
      'Football': 11,
      'Cricket': 11,
      'Basketball': 5,
      'Volleyball': 6,
      'Badminton': 2,
      'Table Tennis': 2
    };
    
    const required = minPlayers[tournament.sport] || 5;
    
    if (team.players.length < required) {
      return res.status(400).json({ 
        success: false,
        message: `Team must have at least ${required} players for ${tournament.sport}` 
      });
    }
    
    // Create registration
    const registration = await Registration.create({
      tournamentId,
      teamId,
      captainId: req.user._id,
      status: 'Pending'
    });
    
    await registration.populate('tournamentId', 'name sport startDate');
    await registration.populate('teamId', 'name logo');
    
    res.status(201).json({
      success: true,
      registration,
      message: 'Registration submitted successfully. Awaiting admin approval.'
    });
    
  } catch (error) {
    console.error('Error creating registration:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Team already registered for this tournament' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/registrations/:id/approve
 * @desc    Approve team registration
 * @access  Private (Admin only)
 */
router.put('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }
    
    if (registration.status === 'Approved') {
      return res.status(400).json({ 
        success: false,
        message: 'Registration already approved' 
      });
    }
    
    // Check if tournament is full
    const tournament = await Tournament.findById(registration.tournamentId);
    
    if (tournament.registeredTeams >= tournament.maxTeams) {
      return res.status(400).json({ 
        success: false,
        message: 'Tournament is full. Cannot approve more registrations.' 
      });
    }
    
    // Approve registration
    registration.status = 'Approved';
    registration.approvedBy = req.user._id;
    registration.approvedAt = new Date();
    registration.rejectionReason = null; // Clear any previous rejection reason
    await registration.save();
    
    // Increment tournament's registered teams count
    tournament.registeredTeams += 1;
    await tournament.save();
    
    await registration.populate('teamId', 'name logo captain');
    await registration.populate('tournamentId', 'name sport');
    await registration.populate('approvedBy', 'username');
    
    res.json({
      success: true,
      registration,
      message: 'Registration approved successfully'
    });
    
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/registrations/:id/reject
 * @desc    Reject team registration
 * @access  Private (Admin only)
 */
router.put('/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a rejection reason (minimum 10 characters)' 
      });
    }
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }
    
    if (registration.status === 'Rejected') {
      return res.status(400).json({ 
        success: false,
        message: 'Registration already rejected' 
      });
    }
    
    // If was previously approved, decrement tournament count
    if (registration.status === 'Approved') {
      const tournament = await Tournament.findById(registration.tournamentId);
      if (tournament.registeredTeams > 0) {
        tournament.registeredTeams -= 1;
        await tournament.save();
      }
    }
    
    // Reject registration
    registration.status = 'Rejected';
    registration.rejectionReason = reason.trim();
    registration.approvedBy = null;
    registration.approvedAt = null;
    await registration.save();
    
    await registration.populate('teamId', 'name logo');
    await registration.populate('tournamentId', 'name sport');
    
    res.json({
      success: true,
      registration,
      message: 'Registration rejected'
    });
    
  } catch (error) {
    console.error('Error rejecting registration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Delete/Cancel registration
 * @access  Private (Captain who created it OR Admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }
    
    // Check if user is captain who created it or admin
    const isOwner = registration.captainId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this registration' 
      });
    }
    
    // If registration was approved, decrement tournament count
    if (registration.status === 'Approved') {
      const tournament = await Tournament.findById(registration.tournamentId);
      if (tournament.registeredTeams > 0) {
        tournament.registeredTeams -= 1;
        await tournament.save();
      }
    }
    
    await Registration.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Registration cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting registration:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Registration not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;