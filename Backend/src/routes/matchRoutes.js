import express from 'express';
import Match from '../models/Match.js';
import { uploadMatchPhotos } from '../middleware/uploadMiddleware.js';
import * as matchController from '../controllers/matchController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/matches/:id/photos
 * @desc    Upload photos for a match (Admin only)
 */
router.post('/:id/photos', protect, admin, (req, res, next) => {
    uploadMatchPhotos.array('photos', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: `Multer Error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { id } = req.params;
        const match = await Match.findById(id);
        if (!match) {
            return res.status(404).json({ message: "Match not found in database." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: "No files received. Ensure the frontend is using formData.append('photos', file)" 
            });
        }

        const newPhotoPaths = req.files.map(file => `/uploads/${file.filename}`);

        if (!Array.isArray(match.images)) {
            match.images = [];
        }

        match.images.push(...newPhotoPaths);
        match.markModified('images');

        await match.save();

        return res.status(200).json({
            message: "Photos added successfully",
            images: match.images
        });

    } catch (error) {
        console.error("Critical Upload Error:", error);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
});

// --- Public Routes ---
router.get('/', matchController.getAllMatches);
router.get('/leaderboard', matchController.getLeaderboard);

// --- Admin Protected Routes ---
router.post('/create', protect, admin, matchController.createMatch);
router.put('/update/:id', protect, admin, matchController.updateScore);

/**
 * @route   DELETE /api/matches/:id
 * @desc    Delete a match (Admin only)
 * FIX: This resolves the "Failed to delete" error in the frontend
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        // Safety Check: Don't delete matches that have scores already recorded
        if (match.scores && (match.scores.home > 0 || match.scores.away > 0)) {
            return res.status(400).json({ 
                message: "Cannot delete a match with recorded scores. Reset scores first." 
            });
        }

        await Match.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server error during deletion", error: error.message });
    }
});

export default router;