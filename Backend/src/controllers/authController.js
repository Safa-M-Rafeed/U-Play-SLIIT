import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendLoginOtpEmail } from '../services/mailjetService.js';

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const formatUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  department: user.department || '',
  identifier: user.identifier || '',
  organization: user.organization || '',
  emergencyContact: user.emergencyContact || '',
  yearOfStudy: user.yearOfStudy || '',
  teamName: user.teamName || '',
  sport: user.sport || '',
  medicalClearance: user.medicalClearance || '',
  leadershipSince: user.leadershipSince || '',
  designation: user.designation || '',
  officeLocation: user.officeLocation || '',
  accessScope: user.accessScope || '',
  avatarUrl: user.avatarUrl || '',
  notificationsEnabled: typeof user.notificationsEnabled === 'boolean' ? user.notificationsEnabled : true,
  createdAt: user.createdAt
});

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['student', 'captain', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Registration successful',
      token: createToken(user._id),
      user: formatUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to register user' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.loginOtpHash = otpHash;
    user.loginOtpExpiresAt = otpExpiresAt;
    await user.save();

    await sendLoginOtpEmail({
      toEmail: user.email,
      toName: user.fullName,
      otp
    });

    console.log(`✅ OTP sent successfully to ${user.email}`);

    res.json({
      message: `OTP sent to ${user.email}. Enter the code to complete login.`,
      otpRequired: true,
      email: user.email
    });
  } catch (error) {
    console.error('❌ loginUser error:', error.message);
    res.status(500).json({ 
      message: 'Unable to send login OTP',
      error: error.message 
    });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.loginOtpHash || !user.loginOtpExpiresAt) {
      return res.status(400).json({ message: 'No active OTP request found' });
    }

    if (user.loginOtpExpiresAt.getTime() < Date.now()) {
      user.loginOtpHash = '';
      user.loginOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please sign in again.' });
    }

    if (hashOtp(String(otp).trim()) !== user.loginOtpHash) {
      return res.status(401).json({ message: 'Invalid OTP code' });
    }

    user.loginOtpHash = '';
    user.loginOtpExpiresAt = null;
    await user.save();

    res.json({
      message: 'Login successful',
      token: createToken(user._id),
      user: formatUser(user)
    });
  } catch (error) {
    console.error('verifyLoginOtp error:', error);
    res.status(500).json({ message: 'Unable to verify OTP' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({ user: formatUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('updateProfile payload:', req.body);

    const {
      fullName,
      email,
      phone,
      department,
      identifier,
      organization,
      emergencyContact,
      yearOfStudy,
      teamName,
      sport,
      medicalClearance,
      leadershipSince,
      designation,
      officeLocation,
      accessScope,
      notificationsEnabled
    } = req.body;

    const nextFullName = (fullName ?? req.user.fullName ?? '').trim();
    const nextEmail = (email ?? req.user.email ?? '').trim().toLowerCase();

    if (!nextFullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!nextEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const existingUser = await User.findOne({
      email: nextEmail,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName: nextFullName,
          email: nextEmail,
          phone: phone?.trim() || '',
          department: department?.trim() || '',
          identifier: identifier?.trim() || '',
          organization: organization?.trim() || '',
          emergencyContact: emergencyContact?.trim() || '',
          yearOfStudy: yearOfStudy?.trim() || '',
          teamName: teamName?.trim() || '',
          sport: sport?.trim() || '',
          medicalClearance: medicalClearance?.trim() || '',
          leadershipSince: leadershipSince?.trim() || '',
          designation: designation?.trim() || '',
          officeLocation: officeLocation?.trim() || '',
          accessScope: accessScope?.trim() || '',
          ...(typeof notificationsEnabled === 'boolean'
            ? { notificationsEnabled }
            : {})
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated for user:', updatedUser._id.toString());

    res.json({
      message: 'Profile updated successfully',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Unable to update profile' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const userWithPassword = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    userWithPassword.password = await bcrypt.hash(newPassword, 10);
    await userWithPassword.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update password' });
  }
};

export const uploadProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatarUrl
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile image updated successfully',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    console.error('uploadProfileAvatar error:', error);
    res.status(500).json({ message: 'Unable to upload profile image' });
  }
};
