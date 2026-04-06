const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true
  },
  
  rejectionReason: {
    type: String,
    default: null,
    maxlength: 500
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });

// Index for filtering by status
registrationSchema.index({ tournamentId: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);s