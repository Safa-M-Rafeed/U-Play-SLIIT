import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: 'bg-blue-500'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Activity', activitySchema);
