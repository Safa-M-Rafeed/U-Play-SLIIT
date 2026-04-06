import express from 'express';
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

router.get('/', getTournaments);
router.post('/', createTournament);
router.post('/generate-format', generateFormat);
router.get('/:id', getTournament);
router.put('/:id', updateTournament);
router.delete('/:id', deleteTournament);
router.post('/:id/clone', cloneTournament);
router.post('/:id/announcements', addAnnouncement);

export default router;