import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  cloneTournament,
  generateFormat,
  addAnnouncement,
} from '../controllers/tournamentController.js';
 
const router = express.Router();
 
// Public/Read routes
router.get('/',                      getTournaments);
router.get('/:id',                   getTournament);
router.post('/generate-format',      generateFormat);

// Admin-only routes
router.post('/',                     protect, admin, createTournament);
router.put('/:id',                   protect, admin, updateTournament);
router.delete('/:id',                protect, admin, deleteTournament);
router.post('/:id/clone',            protect, admin, cloneTournament);

// Admin-only announcements
router.post('/:id/announcements',    protect, admin, addAnnouncement);
 
export default router;
