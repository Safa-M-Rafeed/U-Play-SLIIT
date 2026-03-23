import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    type: {
      type: String,
      enum: ['team', 'tournament', 'user'],
      default: 'team'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Approval', approvalSchema);
