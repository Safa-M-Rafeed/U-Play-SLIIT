const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const Tournament = require('../models/Tournament');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

/**
 * @route   GET /api/announcements/tournament/:tournamentId
 * @desc    Get all announcements for a tournament
 * @access  Public
 */
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const announcements = await Announcement.find({
      tournamentId: req.params.tournamentId
    })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 }); // Newest first
    
    res.json({ 
      success: true,
      announcements,
      count: announcements.length
    });
    
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/announcements/:id
 * @desc    Get single announcement
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('tournamentId', 'name sport');
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
      });
    }
    
    res.json({ 
      success: true,
      announcement 
    });
    
  } catch (error) {
    console.error('Error fetching announcement:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
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
 * @route   POST /api/announcements
 * @desc    Create new announcement
 * @access  Private (Admin only)
 */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { tournamentId, title, content, priority } = req.body;
    
    // Validate required fields
    if (!tournamentId || !title || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide tournament, title, and content' 
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
    
    // Validate title length
    if (title.trim().length < 5 || title.trim().length > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Title must be between 5 and 100 characters' 
      });
    }
    
    // Validate content length
    if (content.trim().length < 10 || content.trim().length > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Content must be between 10 and 1000 characters' 
      });
    }
    
    // Create announcement
    const announcement = await Announcement.create({
      tournamentId,
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'Medium',
      createdBy: req.user._id
    });
    
    // Populate creator
    await announcement.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      announcement,
      message: 'Announcement posted successfully'
    });
    
  } catch (error) {
    console.error('Error creating announcement:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: errors[0] 
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
 * @route   PUT /api/announcements/:id
 * @desc    Update announcement
 * @access  Private (Admin only)
 */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
      });
    }
    
    const { title, content, priority } = req.body;
    
    // Update fields if provided
    if (title) {
      if (title.trim().length < 5 || title.trim().length > 100) {
        return res.status(400).json({ 
          success: false,
          message: 'Title must be between 5 and 100 characters' 
        });
      }
      announcement.title = title.trim();
    }
    
    if (content) {
      if (content.trim().length < 10 || content.trim().length > 1000) {
        return res.status(400).json({ 
          success: false,
          message: 'Content must be between 10 and 1000 characters' 
        });
      }
      announcement.content = content.trim();
    }
    
    if (priority) {
      announcement.priority = priority;
    }
    
    await announcement.save();
    await announcement.populate('createdBy', 'username email');
    
    res.json({
      success: true,
      announcement,
      message: 'Announcement updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating announcement:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
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
 * @route   DELETE /api/announcements/:id
 * @desc    Delete announcement
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
      });
    }
    
    await Announcement.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Announcement deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting announcement:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Announcement not found' 
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