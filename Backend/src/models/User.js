import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    identifier: {
      type: String,
      default: ''
    },
    organization: {
      type: String,
      default: ''
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    yearOfStudy: {
      type: String,
      default: ''
    },
    teamName: {
      type: String,
      default: ''
    },
    sport: {
      type: String,
      default: ''
    },
    medicalClearance: {
      type: String,
      default: ''
    },
    leadershipSince: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    officeLocation: {
      type: String,
      default: ''
    },
    accessScope: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active'
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    loginOtpHash: {
      type: String,
      default: ''
    },
    loginOtpExpiresAt: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['student', 'captain', 'admin'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);
