import express from 'express';
import {
  getMe,
  loginUser,
  registerUser,
  verifyLoginOtp,
  updatePassword,
  updateProfile,
  uploadProfileAvatar
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/avatar', protect, uploadAvatar.single('avatar'), uploadProfileAvatar);

export default router;
