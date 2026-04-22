import express from 'express';
import {
  createTournament,
  deleteTournament,
  deleteUser,
  downloadAdminReport,
  getAdminDashboard,
  getAdminTeams,
  updateApprovalStatus,
  updateTournament,
  updateUserStatus
} from '../controllers/adminController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/teams', getAdminTeams);
router.get('/report', downloadAdminReport);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.post('/tournaments', createTournament);
router.put('/tournaments/:tournamentId', updateTournament);
router.delete('/tournaments/:tournamentId', deleteTournament);
router.patch('/approvals/:approvalId', updateApprovalStatus);

export default router;
